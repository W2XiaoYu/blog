---
layout: doc
title: Windows 桌面
---

# Windows 桌面

## Windows系统托盘

1. 安装`tray_manager: ^0.2.1`，安装高版本会有奇怪的bug(比如右键展示菜单后，点击其他区域应该隐藏菜单，试了好多版本都不生效。)

2. 代码如下

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

## Flutter Windows端使用desktop_multi_window 新建窗口遇到的问题

如题：在使用desktop_multi_window插件新建窗口的时候可以正常新建窗口，但是发现新窗口内无法使用flutter的插件，会报错,如下：

```shell
[ERROR:flutter/runtime/dart_vm_initializer.cc(41)] Unhandled Exception: MissingPluginException(No implementation found for method VideoOutputManager.Create on channel com.alexmercerind/media_kit_video)
#0      MethodChannel._invokeMethod (package:flutter/src/services/platform_channel.dart:313:7)
<asynchronous suspension>
#1      VideoControllerNative.create (package:media_kit_video/src/video_controller_native.dart:81:5)
<asynchronous suspension>
#2      _VideoPlayerState.initState.<anonymous closure> (package:iptv_player/video_player/video_player.dart:38:25)
<asynchronous suspension>

```

参照文章[点我](https://blog.csdn.net/mchangtian/article/details/145837419)
<br/>
编辑`windows/runner/flutter_window.cpp`文件

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

## ValueNotifier的运用场景

使用 `ValueNotifier` 和`setState` 本质上都是在做 状态变更和刷新 UI，但它们有一些重要的区别，尤其是在交互复杂、性能要求高或组件重建频繁的桌面/Flutter Web 环境下，`ValueNotifier` 会更加优雅和高效。

<br>
在windows端，如果想实现鼠标hover效果的同时并且支持事件处理，正常思路是：

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

正常思路这样的确没有问题，hover效果也是可以看到，但是会发现`GestureDetector`的事件消失了
,这是因为 `setState`触发整个`StatefulWidget` 的 `build()` 重建，导致了点击事件的丢失。
这时候可以改用`ValueNotifier`来解决。

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

核心区别总结：

| 对比项 | `setState` |`ValueNotifier`|
|------|------|------|
| 触发范围 | 触发整个 `StatefulWidget` 的 `build()` 重建 |只触发 `ValueListenableBuilder` 区域刷新|
| 适用场景 | 简单状态（页面级状态切换） |局部状态（如 hover、开关、单个按钮状态）|
| 性能 | 会重建整棵 widget 树（当前 widget） |只重建绑定该状态的组件，性能更优|
| 逻辑清晰度| 状态分散在 widget 树中 |状态集中，可封装复用|
| 点击与 hover 不兼容时 |  容易在 `setState()` 导致点击丢失 |状态隔离，互不干扰，体验稳定|

## Windows端输入框限制为英文

在移动端中，我们可以根据`keyboardType`来使用不同的键盘。但是在Window端这样写就没有任何作用了，因为Window端是主要是键盘概念。这时候我们就需要指定键盘：

1. 指定为英文键盘(美式键盘)

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

1. 把当前输入法改为英文

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

以上方法都是在Windows工程下注册的方法，后在flutter端调用的。
