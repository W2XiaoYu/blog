
# Flutter

## 打包&&运行

```bash
# 对应渠道打包
flutter build apk --flavor xxxxx --dart-define=channel=xxxxx 
# 对应渠道运行
flutter run apk --flavor xxxxx --dart-define=channel=xxxxx 

# 更换Java SDK路径
flutter config --jdk-dir "D:\APP\jdk-17.0.12_windows-x64_bin\jdk-17.0.12"
# 拉去远程仓库指定分支到本地并且文件名为分支名字
git clone -b xxxname --single-branch https://gitee.com/test.git xxxname
# 执行生成
flutter packages pub run build_runner build

```

## 安卓端获取OAID问题

```kt

//app\build.gradle 文件添加
dependencies {
    implementation("com.github.gzu-liyujiang:Android_CN_OAID:4.2.7")
}
//在build.gradle添加
repositories {
    google()
    mavenCentral()
    maven { url 'https://developer.huawei.com/repo/' }
    maven { url 'https://jitpack.io' }
}

//kotlin文件夹中的MainActivity文件中加
import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
class MainActivity : FlutterActivity() {
    private val deviceIdentityUtil by lazy { DeviceIdentityUtil(this) }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "device_identity").apply {
            setMethodCallHandler { call, result ->
                when (call.method) {
                    "getOAID" -> {//获取oaid
                        deviceIdentityUtil.getOAID {
                            result.success(it)
                        }
                    }
                    //跳转微信原生方法
                    "startLink" -> {
                        startLink(call.arguments.toString())
                        result.success(null)
                    }
                }
            }
        }
    }

    private fun startLink(link: String?) {
        Intent(Intent.ACTION_VIEW).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            data = Uri.parse(link ?: "")
            startActivity(this)
        }
    }
}

//在上文件同级下 创建DeviceIdentityUtil
import android.content.Context
import com.github.gzuliyujiang.oaid.DeviceID
import com.github.gzuliyujiang.oaid.IGetter


class DeviceIdentityUtil(private val context: Context) {
    fun getOAID(callback: (result: String) -> Unit) {
        DeviceID.getOAID(context, object : IGetter {
            override fun onOAIDGetComplete(result: String?) {
                callback(result ?: "")
            }

            override fun onOAIDGetError(error: Exception) {
                callback("")
            }
        })
    }
}
```

在flutter代码中调用

```dart
class OAID {
  static const MethodChannel _channel = MethodChannel('device_identity');
  static Future<String> getOAID() async {
    return await _channel.invokeMethod('getOAID') ?? "";
  }
}
```

## 安卓端 连续两次返回实现退出应用

```dart
DateTime? _lastPressedAt;
bool canPop = false;

PopScope(
  canPop: canPop,
  onPopInvokedWithResult: (didPop, _) async {
    LoggerUtils.e('返回拦截1111');
    if (AppConfig.isIos()) return;
    if (_currentIndex != 0) {
      setState(() {
        _currentIndex = 0;
      });
      _pageController.jumpToPage(0);
      return;
    }
    if (_lastPressedAt == null ||
        DateTime.now().difference(_lastPressedAt!) >
            const Duration(seconds: 2)) {
      // 两次点击间隔超过 2 秒或者是第一次点击
      _lastPressedAt = DateTime.now();
      showToast(message: '再次按返回键将退出应用');
    } else {
      _lastPressedAt = null;
      // 两次点击间隔小于 2 秒，退出应用
      Commons.exitApp();
    }
  },
  child:....
  )
```

## 生成App图标

```yaml
# 安装依赖
  flutter_launcher_icons: 0.11.0
# 配置信息
  flutter_icons:
    android: true
    ios: true
    image_path_ios: "assets/app/ios.png"
    image_path_android: "assets/app/android.png"
#执行生成
flutter pub run flutter_launcher_icons

```

## 打印数据

可打印json并且格式化，可解决打印超出截断问题 <br/>
需要用到common_utils插件，请先自行安装

```dart
class Log {
  //标识
  //AppConfig.isProduction 判断是否为生产环境
  static const String tag = 'hhy';

  static void init() {
    LogUtil.init(isDebug: !AppConfig.isProduction(), maxLen: 512);
  }

  static void e(String msg, {String tag = tag}) {
    if (!AppConfig.isProduction()) {
      LogUtil.e(msg, tag: tag);
    }
  }

  static void json(String msg, {String tag = tag}) {
    if (!AppConfig.isProduction()) {
      try {
        final dynamic data = convert.json.decode(msg);
        if (data is Map) {
          _printMap(data);
        } else if (data is List) {
          _printList(data);
        } else {
          LogUtil.v(msg, tag: tag);
        }
      } catch (e) {
        LogUtil.e(msg, tag: tag);
      }
    }
  }

  static void _printMap(Map<dynamic, dynamic> data,
      {String tag = tag,
      int tabs = 1,
      bool isListItem = false,
      bool isLast = false}) {
    final bool isRoot = tabs == 1;
    final String initialIndent = _indent(tabs);
    tabs++;

    if (isRoot || isListItem) {
      LogUtil.v('$initialIndent{', tag: tag);
    }

    data.keys.toList().asMap().forEach((index, dynamic key) {
      final bool isLast = index == data.length - 1;
      dynamic value = data[key];
      if (value is String) {
        value = '"$value"';
      }
      if (value is Map) {
        if (value.isEmpty) {
          LogUtil.v('${_indent(tabs)} $key: $value${!isLast ? ',' : ''}',
              tag: tag);
        } else {
          LogUtil.v('${_indent(tabs)} $key: {', tag: tag);
          _printMap(value, tabs: tabs);
        }
      } else if (value is List) {
        if (value.isEmpty || value.length > 50) {
          LogUtil.v('${_indent(tabs)} $key: $value', tag: tag);
        } else {
          LogUtil.v('${_indent(tabs)} $key: [', tag: tag);
          _printList(value, tabs: tabs);
          LogUtil.v('${_indent(tabs)} ]${isLast ? '' : ','}', tag: tag);
        }
      } else {
        final msg = value.toString().replaceAll('\n', '');
        LogUtil.v('${_indent(tabs)} $key: $msg${!isLast ? ',' : ''}', tag: tag);
      }
    });

    LogUtil.v('$initialIndent}${isListItem && !isLast ? ',' : ''}', tag: tag);
  }

  static void _printList(List<dynamic> list, {String tag = tag, int tabs = 1}) {
    list.asMap().forEach((i, dynamic e) {
      final bool isLast = i == list.length - 1;
      if (e is Map) {
        if (_canFlattenMap(e, list)) {
          LogUtil.v('${_indent(tabs)}  $e${!isLast ? ',' : ''}', tag: tag);
        } else {
          _printMap(e, tabs: tabs + 1, isListItem: true, isLast: isLast);
        }
      } else {
        LogUtil.v('${_indent(tabs + 2)} $e${isLast ? '' : ','}', tag: tag);
      }
    });
  }

  /// 避免一秒内输出过多行数的日志被限制显示
  /// Single process limit 250/s drop 66 lines.
  static bool _canFlattenMap(Map<dynamic, dynamic> map, List<dynamic> list) {
    return list.length * map.length > 100;
  }

  static String _indent([int tabCount = 1]) => '  ' * tabCount;
}

//使用
Log.json(data.toString());
```

## 代码片段

### 网络检测组件

网络检测组件，支持点击重试

先安装依赖 connectivity_plus: ^6.1.3

```dart
import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

/// 网络监听组件
class NetworkListener extends StatefulWidget {
  final WidgetBuilder builder;

  const NetworkListener({super.key, required this.builder});

  @override
  State<NetworkListener> createState() => _NetworkListenerState();
}

class _NetworkListenerState extends State<NetworkListener> {
  bool isFirst = true;
  StreamSubscription<List<ConnectivityResult>>? subscription;
  late Future<List<ConnectivityResult>> _connectivityFuture;

  final validConnectivityResults = [
    ConnectivityResult.mobile,
    ConnectivityResult.wifi,
  ];

  @override
  void initState() {
    super.initState();
    _connectivityFuture = Connectivity().checkConnectivity();
  }

  void _retryConnection() {
    setState(() {
      _connectivityFuture = Connectivity().checkConnectivity();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ConnectivityResult>>(
      future: _connectivityFuture,
      builder: (context, snapshot) {
        final state = snapshot.connectionState;
        if (state == ConnectionState.waiting) {
          return const Center(child: CupertinoActivityIndicator());
        }

        final isConnected = snapshot.hasData &&
            snapshot.data!.any((result) => validConnectivityResults.contains(result));

        if (isConnected) {
          return widget.builder(context);
        }

        _setupConnectivityListener();

        return _buildErrorUI();
      },
    );
  }

  Widget _buildErrorUI() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('网络异常，请检查网络'),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: _retryConnection,
            child: const Text('点击重试'),
          ),
        ],
      ),
    );
  }

  void _setupConnectivityListener() {
    subscription ??= Connectivity().onConnectivityChanged.listen((results) {
      if (!isFirst) {
        final isConnected = results.any((result) => validConnectivityResults.contains(result));
        if (isConnected && mounted) {
          setState(() {});
          subscription?.cancel();
          subscription = null;
        }
      } else {
        isFirst = false;
      }
    });
  }

  @override
  void dispose() {
    subscription?.cancel();
    super.dispose();
  }
}


///使用案例
NetworkListener(
  builder: (ctx) {
    return DouyinHome();
  },
)
```

### 抖音首页布局

1. 基本布局

```dart

class DouyinHome extends StatefulWidget {
  const DouyinHome({
    super.key,
  });

  @override
  State<DouyinHome> createState() => _DouyinHomeState();
}

class _DouyinHomeState extends State<DouyinHome> {
  final PageController _pageController = PageController();
  //模拟视频列表
  List<String> videoUrls = [
    'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
    'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
    'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
  ];
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(//定义顶部tab的控制器
      length: 3,
      initialIndex: 0,
      child: _buildBody(),
    );
  }

  Widget _buildVideo() {
    return PageView.builder(
      controller: _pageController,
      scrollDirection: Axis.vertical,
      onPageChanged: (index) {
        setState(
          () {
            _currentPage = index;
          },
        );
      },
      itemBuilder: (context, index) {
        return VideoPlayerItem(
          videoUrl: videoUrls[index],
          isCurrent: index == _currentPage,
        );
      },
    );
  }

  Widget _buildBody() {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          TabBarView(//tabbar的三个界面
            children: [
              Stack(children: [
                _buildVideo(),//视频播放界面
              ]),
              Center(
                child: Text(
                  'page 2',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              Center(
                child: Text(
                  'page 3',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
          Positioned(//顶部的tab 支持沉浸状态栏
            width: MediaQuery.of(context).size.width,
            top: MediaQuery.of(context).padding.top,
            child: SizedBox(
              height: 56.w,
              child: Row(
                children: [
                  SizedBox(
                    width: 20,
                  ),
                  Icon(
                    Icons.live_tv,
                    color: Colors.white,
                  ),
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        left: 40,
                        right: 40,
                        top: 15,
                        bottom: 15,
                      ),
                      child: Center(
                        child: TabBar(
                          splashFactory: NoSplash.splashFactory,
                          //去掉水波纹
                          dividerHeight: 0,
                          indicatorColor: Colors.white,
                          //选中下划线的颜色
                          indicatorSize: TabBarIndicatorSize.label,
                          //选中下划线的长度
                          tabs: [
                            Tab(
                              child: Text(
                                '同城',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                            Tab(
                              child: Text(
                                '关注',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                            Tab(
                              child: Text(
                                '推荐',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Icon(
                    Icons.search,
                    color: Colors.white,
                  ),
                  SizedBox(
                    width: 12.w,
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
```

2. 上下滑动播放视频

```dart
class VideoPlayerItem extends StatefulWidget {
  final String videoUrl;
  final bool isCurrent;

  const VideoPlayerItem({
    super.key,
    required this.videoUrl,
    required this.isCurrent,
  });

  @override
  _VideoPlayerItemState createState() => _VideoPlayerItemState();
}

class _VideoPlayerItemState extends State<VideoPlayerItem> {
  late VideoPlayerController _videoController;
  late ChewieController _chewieController;//视频播放控制插件
  bool _showControls = false;
  bool _isLiked = false;//是否点赞
  int _likeCount = 2345;//点赞数
  bool _isPaused = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();//初始化
  }

  Future<void> _initializePlayer() async {
    _videoController =
        VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl));

    await _videoController.initialize();

    _chewieController = ChewieController(
      videoPlayerController: _videoController,
      autoPlay: true,
      looping: true,
      showControls: false,
    );
    setState(() {});
    if (widget.isCurrent) {//加载完自动播放
      _videoController.play();
    }
  }

  @override
  void didUpdateWidget(VideoPlayerItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isCurrent && !widget.isCurrent) {
      _videoController.pause();
      setState(() {
        _isPaused = true;
      });
    } else if (!oldWidget.isCurrent && widget.isCurrent) {
      _videoController.play();
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    _chewieController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() => _showControls = !_showControls);
      },
      child: Stack(
        children: [
          // 视频播放区域
          _videoController.value.isInitialized
              ? Chewie(controller: _chewieController)
              : Center(
                  child: CupertinoActivityIndicator(
                    animating: true,
                    color: Colors.white,
                    radius: 12,
                  ),
                ),

          //操作遮罩层
          _buildOverlayUI(),
          if (_isPaused)//暂定状态 中间的图标
            GestureDetector(
              onTap: () {
                _videoController.play();
                setState(() {
                  _isPaused = false;
                });
              },
              child: Center(
                child: Icon(
                  Icons.play_arrow,
                  color: Colors.white,
                  size: 240,
                ),
              ),
            )
        ],
      ),
    );
  }

  Widget _buildOverlayUI() {//遮罩层 用来放右侧操作栏 和底部的标题以及进度条等信息
    return GestureDetector(
      behavior: HitTestBehavior.translucent, //让子元素空区域也可以点击
      onTap: () {
        // 确保控制器已初始化
        if (!_videoController.value.isInitialized) return;
        if (_videoController.value.isPlaying) {
          _videoController.pause();
        } else {
          _videoController.play();
        }
        setState(() {
          _isPaused = !_videoController.value.isPlaying;
        });
      },
      child: Container(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // 底部控制区域
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // 左侧用户信息
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('@抖音用户',
                            style: TextStyle(
                                color: Colors.red,
                                fontSize: 18,
                                fontWeight: FontWeight.bold)),
                        SizedBox(height: 10),
                        Text(
                          '这是一个有趣的短视频，快来点赞吧！',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.red,
                          ),
                        ),
                        SizedBox(height: 10),
                        Row(
                          children: [
                            Icon(
                              Icons.music_note,
                              size: 16,
                              color: Colors.red,
                            ),
                            Text(
                              '原声 - 原创音乐',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          alignment: Alignment.center,
                          height: 15.w,
                          child: Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: //视频播放的进度条
                                    VideoProgressBar(
                                  _videoController,
                                  barHeight: 2,
                                  handleHeight: 2,
                                  drawShadow: true,
                                  colors: ChewieProgressColors(
                                    playedColor: Colors.white,
                                    handleColor: Colors.white,
                                    bufferedColor:
                                        Colors.white.withValues(alpha: 0.4),
                                    backgroundColor:
                                        Colors.white.withValues(alpha: 0.4),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 5.w,
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _formatDuration(
                                        _videoController.value.position),
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 12),
                                  ),
                                  Padding(
                                    padding:
                                        EdgeInsets.symmetric(horizontal: 2),
                                    child: Text(
                                      '/',
                                      style: TextStyle(
                                          color: Colors.white, fontSize: 12),
                                    ),
                                  ),
                                  Text(
                                    _formatDuration(
                                        _videoController.value.duration),
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 12),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  // 右侧互动按钮
                  _buildRightActionBar(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRightActionBar() {//右侧
    return Column(
      children: [
        _buildActionButton(
          _isLiked ? Icons.favorite : Icons.favorite_border,
          '$_likeCount',
          () {
            setState(() {
              _isLiked = !_isLiked;
              _likeCount += _isLiked ? 1 : -1;
            });
          },
          color: _isLiked ? Colors.red : Colors.white,
        ),
        _buildActionButton(Icons.comment, '2345', () {}),
        _buildActionButton(Icons.share, '分享', () {}),
        SizedBox(height: 20),
        CircleAvatar(
          radius: 20,
          backgroundImage:
              NetworkImage('https://randomuser.me/api/portraits/men/1.jpg'),
        ),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String text, VoidCallback onTap,
      {Color color = Colors.white}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Column(
        children: [
          IconButton(
            icon: Icon(icon, color: color, size: 32),
            onPressed: onTap,
          ),
          Text(text,
              style: TextStyle(
                  color: color, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {//时间数
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return duration.inHours > 0
        ? "$hours:$minutes:$seconds"
        : "$minutes:$seconds";
  }
}
```

### Windows系统托盘

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

### Flutter Windows端使用desktop_multi_window 新建窗口遇到的问题

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

### ValueNotifier的运用场景

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
| 点击与 hover 不兼容时 | 	容易在 `setState()` 导致点击丢失 |状态隔离，互不干扰，体验稳定|

### 在flutter中解压文件名字乱码问题

flutter里常用的解压软件是`archive`,它默认支持utf-8的,而window上的编码格式是GBK的,就会导致,在window系统上压缩的文件,解压后中文是乱码的.
但是archive不支持配置编码,所以我们就需要手动去处理文件名的编码问题.这时候使用到`charset_converter`来处理编码问题.
```dart
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:archive/archive.dart';
import 'package:archive/archive_io.dart';
import 'package:path/path.dart' as path;
import 'package:charset_converter/charset_converter.dart';

class UnZip {
  static Future<bool> unzip({
    required String zipPath,
    required String outPath,
    Function(double progress)? onProgress, // 进度回调函数
  }) async {
    final zipFile = File(zipPath);
    if (!zipFile.existsSync()) return false;

    try {
      // 计算ZIP文件总大小（用于进度计算）
      final totalSize = await _calculateTotalUncompressedSize(zipPath);
      int processedSize = 0;

      // 创建输入流读取ZIP文件
      final inputStream = InputFileStream(zipPath);

      // 使用ZipDecoder处理流数据
      final archive = ZipDecoder().decodeStream(inputStream);

      // 遍历归档中的每个文件/目录
      for (final file in archive) {
        Uint8List? originalNameBytes;
        String decodedName;

        try {
          //file.name 是utf-8的字符串
          final brokenName = file.name;
          final originalNameBytes = latin1.encode(file.name);
          decodedName = await CharsetConverter.decode(
            'gb18030',
            originalNameBytes,
          );
        } catch (e) {
          print("名字解码失败，${e.toString()}");
          decodedName = file.name;
        }

        final filePath = path.join(outPath, decodedName);

        if (file.isFile) {
          // 创建输出文件流
          final outputStream = OutputFileStream(filePath);

          // 使用流式写入文件内容
          file.writeContent(outputStream);

          // 更新已处理大小
          processedSize += file.size;

          // 计算并回调进度（0.0-1.0）
          if (onProgress != null && totalSize > 0) {
            final progress = processedSize / totalSize;
            onProgress(progress);
          }

          // 关闭输出流
          outputStream.closeSync();
        } else {
          // 创建目录
          await Directory(filePath).create(recursive: true);
        }
      }

      // 确保进度达到100%
      onProgress?.call(1.0);

      return true;
    } catch (e) {
      print("解压失败: $e");
      return false;
    }
  }

  // 计算ZIP文件解压后的总大小
  static Future<int> _calculateTotalUncompressedSize(String zipPath) async {
    try {
      final bytes = await File(zipPath).readAsBytes();
      final archive = ZipDecoder().decodeBytes(bytes);

      int totalSize = 0;
      for (final file in archive) {
        if (file.isFile) {
          totalSize += file.size;
        }
      }

      return totalSize;
    } catch (e) {
      print("计算总大小失败: $e");
      return 0;
    }
  }
}


```
