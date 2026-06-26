---
layout: doc
title: 自定义拖拽与拖拽加密
---

# Flutter Windows 桌面：自定义拖拽 + 拖拽加密实战

> 本文记录 3A Launcher（基于 Flutter 的 Windows 桌面渲染器启动器）在「拖拽素材到外部应用」这件事上的完整方案：为什么不用现成的 `super_drag_and_drop`、如何用 `dart:ffi` 直接驱动 Win32 OLE 绕开幽灵图像、以及如何用 AES-256-GCM 给拖拽数据加密并与 C++ 渲染器对接。

## 背景：两个要解决的问题

### 问题一：OLE ghost image（幽灵图像）

用 `super_drag_and_drop` 把卡片拖到 QQ、微信这类**不支持 OLE drop** 的应用时，拖拽过程中产生的半透明缩略图（ghost image）会**永久卡在屏幕上**，盖在所有窗口的最顶层，只能重启或换壁纸才能清掉。

试过几种 Dart 层的清理方案，全部无效：

| 方案 | 结果 |
|------|------|
| `RedrawWindow` 刷新桌面 | 无效 |
| `SetCursorPos` 微移鼠标 | 无效 |
| COM 模拟 `DoDragDrop` 立即取消 | 无效 |

**根因**：ghost image 是在拖拽过程中（不是松手后）就卡住的，属于 OLE `DoDragDrop` 与目标窗口交互时的系统级 bug，事后清理治标不治本。

### 问题二：拖拽数据可被伪造

把本地素材拖给 3A 渲染器时，如果只是明文传一个文件路径，任何程序都能伪造一段拖拽数据骗渲染器加载任意路径。需要给「拖给自家渲染器」的数据加一层认证加密，防止第三方伪造。

---

## 方案总览

整体是一条端到端的链路，分两条数据通路：

```
┌──────────────┐   ┌──────────────────┐   ┌──────────────────────┐
│ Flutter 手势  │──▶│ Win32 FFI         │──▶│ DoDragDrop (OLE)     │
│ 检测 (4px阈值)│   │ 分层拖拽窗口       │   │ 阻塞 + 模态消息循环   │
└──────────────┘   │ + 像素截图         │   └──────────────────────┘
                   └──────────────────┘            │
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │  按 CF 格式分流                       │
                              ├─────────────────────────────────────┤
                              │ CF_HDROP (普通文件)                   │
                              │   → 资源管理器/3ds Max 等都能接收      │
                              │   → 明文路径                          │
                              ├─────────────────────────────────────┤
                              │ CF_UNICODETEXT (自家渲染器独有扩展名)   │
                              │   → 只有 3A 渲染器能解密               │
                              │   → AES-256-GCM 加密的 path/id/guid   │
                              └─────────────────────────────────────┘
```

**核心取舍**：普通文件（`.skp`/`.max`）走 CF_HDROP 明文，保证拖到资源管理器、3ds Max 等都能用；只有自家渲染器需要识别的独有扩展名（`.art`/`.pak`）才走加密的 CF_UNICODETEXT，普通程序接收到也只是一段乱码字符串。

下面分两部分讲：先讲自定义拖拽（解决问题一），再讲拖拽加密（解决问题二）。

---

## 一、自定义拖拽：绕开 ghost image

### 为什么 ghost image 会产生？

OLE 拖拽的 ghost image 是由 `IDragSourceHelper::InitializeFromBitmap()` 创建的一个分层窗口。`super_drag_and_drop` 内部会调用它来生成漂亮的拖拽预览图——但正是这个分层窗口，在目标窗口不支持 OLE 时会卡死在屏幕上。

### 我们的思路

**完全不使用 `IDragSourceHelper`**，改由自己创建一个独立的 Win32 分层窗口（命名为 `3ADragImageWnd`）来承载拖拽预览图，在 `GiveFeedback` 回调里手动移动它。这样 ghost image 就不是由系统创建的，自然不会卡死。

对比：

| | super_drag_and_drop | 自定义拖拽 |
|---|---|---|
| `IDragSourceHelper` | ✅ 调用（产生 ghost） | ❌ 不调用 |
| ghost image 来源 | 系统 | 自己创建并管理 |
| ghost image 风险 | 有 | 无 |

### 1.1 Flutter 层：手势检测 Widget

核心是一个 `NativeDragWrapper`，用 `Listener` 监听底层指针事件（比 `GestureDetector` 更早拿到事件，零延迟）：

- **拖拽阈值 4px**：鼠标按下后移动超过 4px 才触发拖拽（与 `super_drag_and_drop` 桌面端一致），避免误触
- **RepaintBoundary 截图**：拖拽触发时，把 child 组件渲染成一张图，作为拖拽预览
- **RGBA → BGRA 转换**：Flutter 截图是 RGBA 格式，Win32 分层窗口需要 BGRA，要逐像素交换 R/B 通道

手势处理关键代码：

```dart
class _NativeDragWrapperState extends State<NativeDragWrapper> {
  final _repaintKey = GlobalKey();
  bool _isDragging = false;
  Offset? _pointerDownPos;

  /// 移动超过此距离触发拖拽（与 super_drag_and_drop 桌面端一致）
  static const _dragHitSlop = 4.0;

  @override
  Widget build(BuildContext context) {
    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerDown: widget.isDraggable ? _handlePointerDown : null,
      onPointerMove: widget.isDraggable ? _handlePointerMove : null,
      onPointerUp: _handlePointerUp,
      onPointerCancel: _handlePointerCancel,
      child: RepaintBoundary(
        key: _repaintKey,
        child: widget.child,
      ),
    );
  }

  void _handlePointerMove(PointerMoveEvent event) {
    if (_isDragging || _pointerDownPos == null) return;
    if ((event.position - _pointerDownPos!).distance > _dragHitSlop) {
      _startDrag();
    }
  }

  void _handlePointerUp(PointerUpEvent event) {
    final startPos = _pointerDownPos;
    _pointerDownPos = null;

    // 没有触发拖拽且几乎没移动 → 视为 tap
    if (startPos != null && !_isDragging) {
      final delta = (event.position - startPos).distance;
      if (delta < _dragHitSlop) {
        widget.onTap?.call();
      }
    }
  }
}
```

### 1.2 拖拽数据载体：两种模式

抽象出一个 `DragPayload`，让调用方决定走哪种 CF 格式：

```dart
/// 拖拽数据载体。两种模式：文本（CF_UNICODETEXT）或文件（CF_HDROP）。
abstract class DragPayload {
  String get data;
  /// true = CF_UNICODETEXT，false = CF_HDROP
  bool get isText;
}

/// 文本模式：任意字符串（通常是加密 payload），只有自家渲染器能解
class DragTextPayload extends DragPayload {
  @override
  final String data;
  @override
  final bool isText = true;
  const DragTextPayload(this.data);
}

/// 文件模式：本地文件绝对路径，资源管理器等都能接收
class DragFilePayload extends DragPayload {
  @override
  final String data;
  @override
  final bool isText = false;
  const DragFilePayload(this.data);
}
```

### 1.3 拖拽主流程

`_startDrag()` 是整个流程的核心，按顺序做了 7 件事：

```dart
Future<void> _startDrag() async {
  if (_isDragging) return;
  _isDragging = true;
  _pointerDownPos = null;

  // 1. 解析拖拽数据（调用方通过 dragPayloadProvider 决定走哪种模式）
  final dragPayload = widget.dragPayloadProvider != null
      ? await widget.dragPayloadProvider!()
      : ...; // 其它 provider 的回退
  if (dragPayload == null || dragPayload.data.isEmpty) {
    _isDragging = false;
    return;
  }

  // 2. 截取 child 图像
  final boundary = _repaintKey.currentContext!.findRenderObject()
      as RenderRepaintBoundary;
  final image = await boundary.toImage(pixelRatio: 1.0);
  final byteData = await image.toByteData(format: ui.ImageByteFormat.rawRgba);

  // 3. Flutter RGBA → Win32 BGRA（交换 R/B 通道）
  final pixelCount = image.width * image.height;
  final nativePixels = calloc<Uint32>(pixelCount);
  final rgbaBytes = byteData!.buffer.asUint32List();
  for (var i = 0; i < pixelCount; i++) {
    final px = rgbaBytes[i];
    final r = px & 0xFF;
    final g = (px >> 8) & 0xFF;
    final b = (px >> 16) & 0xFF;
    final a = (px >> 24) & 0xFF;
    nativePixels[i] = (a << 24) | (r << 16) | (g << 8) | b;
  }

  // 4. 创建分层拖拽窗口 + 设置位图 + 定位到鼠标
  final hwnd = NativeFileDrag.createDragWindow(image.width, image.height);
  NativeFileDrag.setDragWindowFromPixels(hwnd, image.width, image.height, nativePixels);
  calloc.free(nativePixels);

  final pos = NativeFileDrag.getCursorPosition();
  NativeFileDrag.moveDragWindow(hwnd, pos.x - image.width ~/ 2, pos.y - image.height ~/ 2);
  NativeFileDrag.showDragWindow(hwnd);

  // 5. 隐藏整个应用窗口（避免 Flutter 自己的窗口干扰 OLE 拖拽）
  await windowManager.hide();

  // ↓↓↓ 同步阻塞，DoDragDrop 自带模态消息循环 ↓↓↓

  // 6. 阻塞调用 DoDragDrop，按模式分流
  bool accepted;
  try {
    if (dragPayload.isText) {
      accepted = NativeFileDrag.startDragWithText(
        dragPayload.data, hwnd, image.width ~/ 2, image.height ~/ 2,
      );
    } else {
      accepted = NativeFileDrag.startDrag(
        dragPayload.data, hwnd, image.width ~/ 2, image.height ~/ 2,
      );
    }
  } finally {
    // 7. 销毁拖拽窗口 + 恢复应用窗口
    NativeFileDrag.destroyDragWindow(hwnd);
    await windowManager.show();
  }

  if (mounted) {
    _showToast(accepted ? '文件已发送' : '目标不支持拖拽');
  }
  _isDragging = false;
}
```

几个关键点：

1. **第 5 步隐藏整个应用窗口**：这一步容易被忽略但很关键。如果不隐藏，Flutter 窗口本身会参与 OLE 的 hit-test，产生奇怪的闪烁。
2. **第 6 步是阻塞调用**：`DoDragDrop` 内部自带一个模态消息循环，会一直阻塞到拖拽结束（松手或取消）才返回。期间通过 `IDropSource` 的 COM 回调来控制流程。
3. **不用 `IDragSourceHelper`**：拖拽预览图完全由我们自己的 `3ADragImageWnd` 分层窗口承载，在 `GiveFeedback` 回调里跟随鼠标移动，松手后销毁——全程不经过系统的 ghost image 机制。

### 1.4 FFI 层：驱动 Win32 OLE

`NativeFileDrag` 通过 `dart:ffi` 直接打开 `ole32.dll`、`user32.dll`、`kernel32.dll`、`gdi32.dll`，查找并用 `DynamicLibrary.open` 拿到这些函数：

```dart
class NativeFileDrag {
  static final _user32 = DynamicLibrary.open('user32.dll');
  static final _ole32 = DynamicLibrary.open('ole32.dll');
  static final _kernel32 = DynamicLibrary.open('kernel32.dll');
  static final _gdi32 = DynamicLibrary.open('gdi32.dll');

  // DoDragDrop 是关键，OLE 拖拽的入口
  static final _doDragDrop = _ole32.lookupFunction<
      Int32 Function(Pointer, Pointer, Uint32, Pointer<Uint32>),
      int Function(Pointer, Pointer, int, Pointer<Uint32>)>('DoDragDrop');

  // 剪贴板格式常量
  static const int _cfHdrop = 15;        // CF_HDROP：文件列表
  static const int _cfUnicodeText = 13;  // CF_UNICODETEXT：UTF-16 文本
}
```

CF_HDROP 的内存布局（这是 Windows 拖拽文件的标准格式，文件管理器、3ds Max 都认它）：

```c
// 内存布局：
// [DROPFILES 结构体] [文件路径1\0] [文件路径2\0] ... [\0]
//
// DROPFILES {
//   DWORD pFiles = 20;  // sizeof(DROPFILES)，文件路径起始偏移
//   POINT pt = {0, 0};
//   BOOL  fNC = FALSE;
//   BOOL  fWide = TRUE; // 使用 wchar_t
// }
// 紧接其后：L"E:\\path\\file.max\0\0"
```

为了驱动 `DoDragDrop`，还需要手动构造两个 COM 对象（COM 对象本质就是一块带 vtable 指针的内存 + 一组函数指针实现的回调）：

- **`IDataObject`**：在 `GetData` 回调里，根据请求的 `cfFormat` 返回对应的 HGLOBAL（CF_HDROP 或 CF_UNICODETEXT）
- **`IDropSource`**：
  - `QueryContinueDrag`：检测鼠标松开（返回 `DRAGDROP_S_DROP`）或 ESC（返回 `DRAGDROP_S_CANCEL`），并移动我们的分层窗口
  - `GiveFeedback`：返回 `DRAGDROP_S_USEDEFAULTCURSORS` 让系统画光标

这部分代码较长（涉及手写 COM vtable、`QueryInterface`/`AddRef`/`Release`），核心思路就是「用 Dart 模拟 C++ 写 COM 组件」。

---

## 二、拖拽加密：AES-256-GCM + scrypt

### 为什么加密？

拖给自家 3A 渲染器的素材（`.art`/`.pak`），路径如果明文走 CF_UNICODETEXT，任何程序都能伪造一段字符串骗渲染器加载任意文件。加密后：

- **GCM 认证标签（authTag）防篡改**：密文被改一个字节，解密时 tag 校验直接失败
- **渲染器只信任能解开的 payload**：密钥双方硬编码一致，第三方拿不到密钥就伪造不出合法 payload

需要强调的是这套方案的**安全边界**：

> 它**不防路径泄露**（path 本身就在密文里，拿到密文+密钥就能解出来），只防伪造/篡改。本质是一个「带认证的握手令牌」，不是为保密设计的。真正的密钥也写死在源码里，没有密钥分发——对一个需要双端硬编码一致的桌面应用来说足够了。

### 2.1 什么时候触发加密？

用一个扩展名白名单来决定：只有 `.art`/`.pak` 这两种自家渲染器独有格式才加密，其它格式（`.skp`/`.max` 等标准 3D 格式）走明文 CF_HDROP。

```dart
class AppConfig {
  /// 拖拽 plainText 走加密 payload 的扩展名白名单（大小写不敏感）。
  /// 不在此列表的文件直接传明文路径，避免文本框/聊天软件拖不进去。
  /// 3D 模型只有 .max/.skp，不加密；新增类型直接加进来即可。
  static const Set<String> dragEncryptedExtensions = {'.art', '.pak'};
}
```

```dart
/// [filePath] 扩展名是否在加密白名单内（大小写不敏感）。
static bool shouldEncrypt(String filePath) {
  final lower = filePath.toLowerCase();
  return AppConfig.dragEncryptedExtensions.any(lower.endsWith);
}
```

### 2.2 加密协议：scrypt 派生 + AES-GCM

加密算法选 **AES-256-GCM**（认证加密，自带防篡改），密钥用 **scrypt** 从一个固定 passphrase 派生（而不是直接当 AES key 用），这样即使 passphrase 是 ASCII 字符串，也能得到高熵的 256-bit 密钥。

参数：

| 参数 | 值 | 说明 |
|------|-----|------|
| passphrase | 硬编码 | 双端一致，写在源码里 |
| salt | 硬编码 | 双端一致 |
| scrypt N | 16384 | CPU/内存成本参数 |
| scrypt r | 8 | 块大小参数 |
| scrypt p | 1 | 并行参数 |
| key length | 32 字节 | AES-256 |
| IV | 12 字节 | GCM 标准 nonce，**每次拖拽随机新生成** |
| authTag | 16 字节 | GCM-128 认证标签 |

输出格式是三段 hex 用冒号分隔：

```
<iv_hex>:<authTag_hex>:<cipher_hex>
```

| 字段 | 长度（字节） | hex 长度 | 说明 |
|------|------------|---------|------|
| iv | 12 | 24 | AES-GCM 随机 nonce，每次拖拽新生成 |
| authTag | 16 | 32 | GCM-128 认证标签，篡改即解密失败 |
| cipher | N | 2N | UTF-8 编码 JSON 的密文 |

### 2.3 加密实现

```dart
import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:pointycastle/export.dart';

class DragPayloadCodec {
  DragPayloadCodec._();

  // 生产环境密钥。修改需同步改 C++ 端（渲染器解密方）。
  // ⚠️ 下方为示例占位值，请替换成你自己的随机串（建议 64 hex / 32 hex），
  //    可用 `openssl rand -hex 32` / `openssl rand -hex 16` 生成。
  static const String _kPassphrase =
      '0000000000000000000000000000000000000000000000000000000000000000';
  static const String _kSalt = '00000000000000000000000000000000';

  static const int _kScryptN = 16384;
  static const int _kScryptR = 8;
  static const int _kScryptP = 1;
  static const int _kKeyLength = 32; // AES-256

  static const int _kIvLength = 12;
  static const int _kTagLength = 16; // GCM-128 bit tag

  static Uint8List? _cachedKey;

  /// 加密为 `iv_hex:authTag_hex:cipher_hex`。
  /// 明文是 JSON {"path": ..., "id": ..., "guid": ...}，id/guid 可选。
  static String encode({required String filePath, int? id, String? guid}) {
    final key = _deriveKey();
    final iv = _randomBytes(_kIvLength);

    final json = jsonEncode({
      'path': filePath,
      if (id != null) 'id': id,
      if (guid != null) 'guid': guid,
    });
    final plain = Uint8List.fromList(utf8.encode(json));

    final cipher = GCMBlockCipher(AESEngine())
      ..init(
        true,
        AEADParameters(KeyParameter(key), _kTagLength * 8, iv, Uint8List(0)),
      );
    final out = Uint8List(plain.length + _kTagLength);
    var len = cipher.processBytes(plain, 0, plain.length, out, 0);
    len += cipher.doFinal(out, len);

    // pointycastle GCM 输出 = cipher || tag（末 16 字节是 tag）
    final cipherPart = out.sublist(0, len - _kTagLength);
    final tagPart = out.sublist(len - _kTagLength, len);
    return '${_hexEncode(iv)}:${_hexEncode(tagPart)}:${_hexEncode(cipherPart)}';
  }

  /// scrypt 派生密钥，结果缓存（N=16384 单次 ~30ms）。
  static Uint8List _deriveKey() {
    if (_cachedKey != null) return _cachedKey!;
    final scrypt = Scrypt()
      ..init(
        ScryptParameters(
          _kScryptN,
          _kScryptR,
          _kScryptP,
          _kKeyLength,
          Uint8List.fromList(utf8.encode(_kSalt)),
        ),
      );
    _cachedKey = scrypt.process(Uint8List.fromList(utf8.encode(_kPassphrase)));
    return _cachedKey!;
  }

  static Uint8List _randomBytes(int len) {
    final r = Random.secure();
    final out = Uint8List(len);
    for (var i = 0; i < len; i++) {
      out[i] = r.nextInt(256);
    }
    return out;
  }

  static const _hexDigits = '0123456789abcdef';

  static String _hexEncode(Uint8List bytes) {
    final s = StringBuffer();
    for (final b in bytes) {
      s.write(_hexDigits[b >> 4]);
      s.write(_hexDigits[b & 0x0f]);
    }
    return s.toString();
  }
}
```

两个细节值得注意：

1. **scrypt 结果要缓存**：`N=16384` 的 scrypt 单次耗时约 30ms，拖拽是高频手势，每次都派生会有明显卡顿。派生结果在内存里缓存一份即可（key 是固定的，不需要每次重算）。
2. **IV 每次随机**：GCM 用同一个 (key, IV) 加密两条不同消息会泄露信息，所以 IV 必须每次随机新生成（`Random.secure()`），这也是为什么 IV 要跟着密文一起传输。

### 2.4 在拖拽处接入加密

回到 `NativeDragWrapper` 的调用方——卡片组件根据文件类型决定走哪种模式：

```dart
return NativeDragWrapper(
  isDraggable: true,
  // .pak / .art 走 CF_UNICODETEXT 加密 payload（渲染器端解密验签）
  // 其它格式（.skp / .max 等）走 CF_HDROP 原生文件拖拽
  dragPayloadProvider: () async {
    final itemId = data.mItemId!;
    final localPath = await notifier.getDownloadedMainFilePath(itemId);
    if (localPath == null || localPath.isEmpty) return null;

    if (DragPayloadCodec.shouldEncrypt(localPath)) {
      // 自家独有格式 → 加密后走文本拖拽
      final record = await DriftDatabaseService.getByRemoteItemId(itemId);
      return DragTextPayload(
        DragPayloadCodec.encode(
          filePath: localPath,
          id: itemId,
          guid: record?.guid,
        ),
      );
    }
    // 标准格式 → 明文文件拖拽
    return DragFilePayload(localPath);
  },
  onTap: () => notifier.openResourceDetail(item),
  child: _buildCardChild(),
);
```

---

## 三、两种 CF 格式的取舍

为什么 `.pak`/`.art` 要走 CF_UNICODETEXT 而不是 CF_HDROP？因为这两种是渲染器私有格式，资源管理器根本打不开。如果走 CF_HDROP 明文路径，用户拖到资源管理器会复制出一个打不开的文件；而走 CF_UNICODETEXT，普通程序接收到的就是一段看不懂的加密字符串，只有 3A 渲染器会去尝试解密。

| 对比项 | CF_HDROP（文件） | CF_UNICODETEXT（文本） |
|--------|----------------|---------------------|
| 接收方 | 资源管理器、3ds Max 等通用 | 只有自家渲染器会处理 |
| 数据内容 | 明文文件路径 | 加密的 path/id/guid |
| 是否加密 | 否 | AES-256-GCM |
| 拖到 QQ/聊天软件 | 传文件（可能失败） | 传一段加密字符串（无害） |
| 适用文件 | `.skp`/`.max` 等标准格式 | `.art`/`.pak` 等私有格式 |

---

## 四、跨语言对接：C++ 解密端

渲染器是 C++/UE 工程，需要一套能解密 Dart 端加密 payload 的实现。对接的关键是**双端参数逐字一致**：passphrase、salt、scrypt 的 N/r/p、key length、IV/tag 长度、输出格式 `iv:tag:cipher`。

C++ 端的实现要点：

1. **scrypt 手写实现**：Windows 没有现成的 scrypt API，需要手写 Salsa20/8 core + scrypt KDF（约 140 行 C++）
2. **AES-256-GCM 用 Windows BCrypt**：`BCryptOpenAlgorithmProvider` + `BCryptDecrypt`，无需第三方依赖（OpenSSL/libsodium）
3. **hex 解码 + 最小 JSON 提取**：payload 是 hex 字符串，解出 `path`/`id`/`guid` 字段即可，不需要完整 JSON 解析器

C++ 端的核心常量必须和 Dart 端完全一致：

```cpp
// 与 Dart 端 drag_payload_codec.dart 逐字一致
// ⚠️ 下方为示例占位值，替换成与 Dart 端相同的随机串
static const char* kPassphrase =
    "0000000000000000000000000000000000000000000000000000000000000000";
static const char* kSalt = "00000000000000000000000000000000";

constexpr int kScryptN = 16384;
constexpr int kScryptR = 8;
constexpr int kScryptP = 1;
constexpr int kKeyLength = 32;  // AES-256
```

> 提示：C++ 端的完整实现（`DeriveKey` + scrypt + BCrypt AES-GCM + hex 解码 + JSON 提取）在项目 `docs/3a_drag_decrypt.{h,cpp}` 和 `docs/拖拽payload解密接入指南.md` 里有完整代码和接入示例（UE/VS），本文不再展开。

---

## 五、踩过的坑

### 坑一：ghost image 事后清理无效

前面背景里列的三种清理方案（`RedrawWindow`、`SetCursorPos`、模拟 `DoDragDrop`）都无效，因为 ghost image 在拖拽**过程中**就卡住了。最终只能从源头解决——根本不让系统创建 ghost image。

### 坑二：GCM 输出的内存布局是 cipher || tag

pointycastle 的 `GCMBlockCipher.doFinal` 输出是 `密文 + tag` 拼在一起（tag 在末尾 16 字节），输出时要手动拆开：

```dart
final out = Uint8List(plain.length + _kTagLength);
var len = cipher.processBytes(plain, 0, plain.length, out, 0);
len += cipher.doFinal(out, len);

// out = [cipher...][tag(16字节)]，要拆成两段
final cipherPart = out.sublist(0, len - _kTagLength);
final tagPart = out.sublist(len - _kTagLength, len);
```

如果不拆，把整段当成密文 + 空 tag 传给 C++ 端，解密必然失败。

### 坑三：Dart String 的 codeUnitAt 与 UTF-16

构造 CF_UNICODETEXT 的 HGLOBAL 时，Dart `String` 的 `codeUnitAt(i)` 直接对应 UTF-16 code unit（含 surrogate pair），可以直接写入 `Uint16` 数组，**不需要额外编码转换**：

```dart
final wPtr = ptr.cast<Uint16>();
for (var i = 0; i < text.length; i++) {
  wPtr[i] = text.codeUnitAt(i); // 直接是 UTF-16，含 emoji 也能正确传输
}
wPtr[text.length] = 0; // 终止符
```

这一点容易被忽略——以为要走 `utf8.encode` → 再转 UTF-16 的两步，实际上 Dart 字符串内部就是 UTF-16。

### 坑四：拖拽时要隐藏整个应用窗口

`DoDragDrop` 期间如果不隐藏 Flutter 自己的窗口，Flutter 窗口会参与 OLE 的 `DragEnter`/`DragOver` hit-test，导致拖到应用自身边缘时出现闪烁和异常。隐藏 → 拖拽 → 恢复的三步顺序要严格保证。

---

## 小结

这套方案的核心思路可以归纳成两条：

1. **绕开 ghost image**：不用 `IDragSourceHelper`，自己创建分层窗口承载拖拽预览，配合隐藏应用窗口 + 阻塞式 `DoDragDrop`，从源头杜绝幽灵图像。
2. **加密走文本通道**：把「拖给自家渲染器」的私有格式数据加密成字符串，走 CF_UNICODETEXT；标准格式继续走 CF_HDROP 明文。两者由扩展名白名单切换。

如果只是想做「Flutter 桌面拖文件到外部应用」，`desktop_drop` / `super_drag_and_drop` 仍然是最省事的选择；只有遇到 ghost image 卡屏、或需要加密防伪造这种强需求时，才值得上这套 FFI + COM + AES-GCM 的重方案。希望能给做 Flutter Windows 桌面拖拽的朋友一点参考。
