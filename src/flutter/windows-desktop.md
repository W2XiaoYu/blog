---
layout: doc
title: Windows 桌面
---

# Windows 桌面

Flutter 到了 Windows 上，会遇到不少移动端没有的事情：系统托盘、多窗口、鼠标悬停和输入法切换。这里按问题记录已经验证过的处理方式。

## Windows 系统托盘

1. 安装 `tray_manager: ^0.2.1`。这个项目曾在较高版本里遇到右键菜单无法正常收起的问题，因此暂时固定在该版本。

2. 初始化托盘并监听点击事件：

```dart
class _MyHomePageState extends State<MyHomePage>
    with TrayListener, WindowListener {
  _initTray() async {
    await trayManager.destroy();
    // 托盘菜单
    await trayManager.setIcon('assets/images/pc_icon.ico');
    await trayManager.setToolTip('setToolTip');
    await trayManager.setContextMenu(trayMenu);
  }

  final _list = [LayoutHome(), LayoutMine()];
  int _selectedIndex = 0;
  bool _isFullScreen = false;

  @override
  void initState() {
    trayManager.addListener(this);
    windowManager.addListener(this);
    _initTray();
    super.initState();
  }

  @override
  void dispose() {
    windowManager.addListener(this);
    trayManager.removeListener(this);
    super.dispose();
  }

  @override
  void onTrayIconMouseDown() {
    windowManager.show();
    windowManager.focus();
  }

  @override
  void onTrayIconRightMouseDown() {
    trayManager.popUpContextMenu();
  }

  @override
  void onTrayIconRightMouseUp() {
    // do something
  }

  @override
  void onTrayMenuItemClick(MenuItem menuItem) {
    print('${menuItem.toJson()}');
    if (menuItem.key == 'show_window') {
      windowManager.show();
      windowManager.focus();
    } else if (menuItem.key == 'exit_app') {
      trayManager.destroy(); // 销毁托盘
      exit(0); // 退出程序
    }
  }

  @override
  Widget build(BuildContext context) {
    return null;
  }

}


```

## `desktop_multi_window` 新窗口找不到插件

`desktop_multi_window` 能正常创建新窗口，但新窗口里的 Flutter 插件没有完成注册，调用时会抛出 `MissingPluginException`：

```shell
[ERROR:flutter/runtime/dart_vm_initializer.cc(41)] Unhandled Exception: MissingPluginException(No implementation found for method VideoOutputManager.Create on channel com.alexmercerind/media_kit_video)
#0      MethodChannel._invokeMethod (package:flutter/src/services/platform_channel.dart:313:7)
<asynchronous suspension>
#1      VideoControllerNative.create (package:media_kit_video/src/video_controller_native.dart:81:5)
<asynchronous suspension>
#2      _VideoPlayerState.initState.<anonymous closure> (package:iptv_player/video_player/video_player.dart:38:25)
<asynchronous suspension>

```

处理时需要编辑 `windows/runner/flutter_window.cpp`，在新窗口创建后补一次插件注册。参考：[Flutter desktop_multi_window 多窗口插件注册](https://blog.csdn.net/mchangtian/article/details/145837419)。

```cpp
//在OnCreate() 方法添加
SetChildContent(flutter_controller_->view()->GetNativeWindow());
// --------OnCreate 方法添加内容---------------------------------
DesktopMultiWindowSetWindowCreatedCallback([](void *controller) {
auto *flutter_controller_sub_ =
reinterpret_cast<flutter::FlutterViewController *>(controller);
auto *registry = flutter_controller_sub_->engine();
// call generated_plugin_registrant
RegisterPlugins(registry);
});
// --------OnCreate 方法添加内容---------------------------------
flutter_controller_->engine()->SetNextFrameCallback(& {
this->Show();
});


```

## 用 `ValueNotifier` 隔离局部 hover 状态

`ValueNotifier` 和 `setState` 都能触发 UI 更新，区别在于刷新范围。桌面端的 hover 状态变化很频繁，如果只想改一个按钮，用 `ValueNotifier` 把更新收在局部会更合适。

<br>
常见写法是用 `MouseRegion` 记录 hover，再由 `GestureDetector` 处理点击：

```dart
MouseRegion(
  cursor: SystemMouseCursors.click,
  onEnter: (e) {
    setState(() {
      isTextHover = true;
    });
  },
  onExit: (e) {
    setState(() {
      isTextHover = false;
    });
  },
  child: GestureDetector(
    onTap: () {},
    child: null,
  ),
),

```

视觉上的 hover 已经生效，但频繁调用 `setState` 会让整个 `StatefulWidget` 重建，某些交互里还可能打断点击。把状态换成 `ValueNotifier` 后，只重建按钮所在的小块区域：

```dart

final ValueNotifier<bool> isTextHover = ValueNotifier(false);

MouseRegion(
  cursor: SystemMouseCursors.click,
  onEnter: (_) => isTextHover.value = true,
  onExit: (_) => isTextHover.value = false,
  child: ValueListenableBuilder<bool>(
    valueListenable: isTextHover,
    builder: (context, value, child) {
      return GestureDetector(
        onTap: () async {
          print("点击了兑换");
      
        },
        child: Container(
          decoration: BoxDecoration(
            color: Colors.red,
            borderRadius:
                const BorderRadius.all(Radius.circular(6.0)),
            border: Border.all(
              color: ColorUtil.purpaseRecColor,
              width: 1, 
            ),
          ),
          height: 32,
          width: 60,
          child: Center(
            child: Text(
              LanguageUtil.confirmKey.tr,
              style: TextStyle(
                fontSize: 12,
                color: !isTextHover.value
                    ? ColorUtil.loginDialogTextColor
                    : ColorUtil.loginDialogHoverTextColor,
                fontFamily: "微软雅黑",
              ),
            ),
          ),
        ),
      );
    },
  ),
),
```

两种方式的差别放在一起看更直观：

| 对比项 | `setState` |`ValueNotifier`|
|------|------|------|
| 触发范围 | 触发整个 `StatefulWidget` 的 `build()` 重建 |只触发 `ValueListenableBuilder` 区域刷新|
| 适用场景 | 简单状态（页面级状态切换） |局部状态（如 hover、开关、单个按钮状态）|
| 性能 | 会重建整棵 widget 树（当前 widget） |只重建绑定该状态的 builder 块|
| 逻辑清晰度| 状态分散在 widget 树中 |状态收在一个 `ValueNotifier` 里，多处可订阅|
| 点击与 hover 不兼容时 |  容易在 `setState()` 导致点击丢失 |hover 只刷新按钮本身，不会打断点击|

## Windows 输入框切换到英文输入法

移动端可以通过 `keyboardType` 请求不同的软键盘，Windows 使用的却是系统输入法，因此这个属性不起作用。需要限制英文输入时，只能从原生窗口切换键盘布局或输入法状态。

1. 激活美式英文键盘布局：

```cpp
HKL hkl = LoadKeyboardLayout(L"00000409", KLF_ACTIVATE);
if (hkl != NULL) {
    HKL currentLayout = GetKeyboardLayout(0);
    if (currentLayout != hkl) {
        ActivateKeyboardLayout(hkl, KLF_SETFORPROCESS);
    }
    result->Success(flutter::EncodableValue(true));
} else {
    result->Error("load_layout_failed", "无法加载英文输入法布局");
}

```

2. 把当前输入法切到英文模式：

```cpp
HWND hwnd = GetForegroundWindow();
if (!hwnd) {
    result->Error("input_error", "Failed to get foreground window");
    return;
}

HIMC imc = ImmGetContext(hwnd);
if (!imc) {
    result->Error("input_error", "Failed to get IME context");
    return;
}

bool success = ImmSetConversionStatus(imc, IME_CMODE_ALPHANUMERIC,
                                      IME_SMODE_NONE);

ImmReleaseContext(hwnd, imc);

if (success) {
    result->Success(flutter::EncodableValue(true));
} else {
    result->Error("input_error", "Failed to set IME to English mode");
}
```

这两段代码都注册在 Windows Runner 中，再通过 MethodChannel 从 Flutter 侧调用。
