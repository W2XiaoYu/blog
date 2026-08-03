---
layout: doc
title: 代码片段
---

# 代码片段

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

## 网络检测组件

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

## 抖音首页布局

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

1. 上下滑动播放视频

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

## 在flutter中解压文件名字乱码问题

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

## 文件切片上传（前端部分）
>
> 相关文档：[Go 后端实现](../back-end/go.md)



flutter端使用的库

```yaml
  file_picker: ^10.3.8
  crypto: ^3.0.7
  dio: ^5.7.0
```

UI层就不再赘述了

```dart
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 文件上传状态模型
class UploadState {
  final PlatformFile? selectedFile;
  final bool isUploading;
  final String? uploadMessage;
  final double uploadProgress; // 上传进度 0-1
  final String? fileHash; // 文件哈希值
  final String? uploadedFilePath; // 上传成功后的文件路径
  final int uploadedChunks; // 已上传的分片数
  final int totalChunks; // 总分片数

  UploadState({
    this.selectedFile,
    this.isUploading = false,
    this.uploadMessage,
    this.uploadProgress = 0.0,
    this.fileHash,
    this.uploadedFilePath,
    this.uploadedChunks = 0,
    this.totalChunks = 0,
  });

  UploadState copyWith({
    PlatformFile? selectedFile,
    bool? isUploading,
    String? uploadMessage,
    double? uploadProgress,
    String? fileHash,
    String? uploadedFilePath,
    int? uploadedChunks,
    int? totalChunks,
  }) {
    return UploadState(
      selectedFile: selectedFile ?? this.selectedFile,
      isUploading: isUploading ?? this.isUploading,
      uploadMessage: uploadMessage ?? this.uploadMessage,
      uploadProgress: uploadProgress ?? this.uploadProgress,
      fileHash: fileHash ?? this.fileHash,
      uploadedFilePath: uploadedFilePath ?? this.uploadedFilePath,
      uploadedChunks: uploadedChunks ?? this.uploadedChunks,
      totalChunks: totalChunks ?? this.totalChunks,
    );
  }
}

// 文件上传 Notifier
class UploadNotifier extends Notifier<UploadState> {
  late final Dio _dio;

  @override
  UploadState build() {
    // 初始化 Dio
    _dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:8080',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );
    return UploadState();
  }

  // 选择文件
  Future<void> selectFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.any,
        allowMultiple: false,
      );

      if (result != null && result.files.isNotEmpty) {
        state = state.copyWith(
          selectedFile: result.files.first,
          uploadMessage: null,
          uploadProgress: 0.0,
        );
      }
    } catch (e) {
      state = state.copyWith(uploadMessage: '文件选择失败: $e');
    }
  }

  // 清除选择的文件
  void clearFile() {
    state = UploadState();
  }

  // 上传文件（切片上传）
  Future<void> uploadFile() async {
    if (state.selectedFile == null) {
      state = state.copyWith(uploadMessage: '请先选择文件');
      return;
    }

    state = state.copyWith(
      isUploading: true,
      uploadMessage: null,
      uploadProgress: 0.0,
    );

    try {
      // 读取文件字节
      final Uint8List bytes;
      if (kIsWeb) {
        bytes = state.selectedFile!.bytes!;
      } else {
        bytes = await File(state.selectedFile!.path!).readAsBytes();
      }

      // 计算文件哈希值
      final fileHash = sha256.convert(bytes).toString();
      debugPrint('文件哈希值: $fileHash');

      state = state.copyWith(fileHash: fileHash);

      // 分片配置
      const int chunkSize = 2 * 1024 * 1024; // 2MB 每片
      final int totalSize = bytes.length;
      final int totalChunks = (totalSize / chunkSize).ceil();

      debugPrint('文件总大小: $totalSize bytes');
      debugPrint('总分片数: $totalChunks');

      // 设置总分片数
      state = state.copyWith(totalChunks: totalChunks);

      // 逐片上传
      String? uploadedPath;
      for (int i = 0; i < totalChunks; i++) {
        final int start = i * chunkSize;
        final int end = (start + chunkSize < totalSize)
            ? start + chunkSize
            : totalSize;

        final Uint8List chunkData = bytes.sublist(start, end);

        // 计算分片哈希值
        final chunkHash = sha256.convert(chunkData).toString();

        final response = await _uploadChunk(
          fileName: state.selectedFile!.name,
          fileHash: fileHash,
          chunkIndex: i,
          totalChunks: totalChunks,
          file: chunkData,
          chunkHash: chunkHash,
        );

        // 更新进度
        final progress = (i + 1) / totalChunks;
        state = state.copyWith(
          uploadProgress: progress,
          uploadedChunks: i + 1,
        );

        debugPrint(
          '已上传: ${i + 1}/$totalChunks 片 (${(progress * 100).toStringAsFixed(1)}%)',
        );

        // 检查是否全部完成
        if (response != null && response['allCompleted'] == true) {
          uploadedPath = response['path'];
          debugPrint('文件合并完成！文件路径: $uploadedPath');
        }
      }

      // 上传完成
      state = state.copyWith(
        isUploading: false,
        uploadProgress: 1.0,
        uploadedFilePath: uploadedPath,
        uploadMessage: uploadedPath != null
            ? '文件上传成功！\n文件名: ${state.selectedFile!.name}\n保存路径: $uploadedPath'
            : '文件上传成功: ${state.selectedFile!.name}',
      );
    } catch (e) {
      debugPrint('上传失败: $e');
      state = state.copyWith(isUploading: false, uploadMessage: '上传失败: $e');
    }
  }

  // 上传单个分片
  Future<Map<String, dynamic>?> _uploadChunk({
    required String fileName,
    required String fileHash,
    required int chunkIndex,
    required int totalChunks,
    required Uint8List file,
    required String chunkHash,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          file,
          filename: 'chunk_$chunkIndex.part',
        ),
        'filename': fileName,
        'chunkIndex': chunkIndex.toString(),
        'totalChunks': totalChunks.toString(),
        'chunkHash': chunkHash,
        'fileHash': fileHash,
      });

      final response = await _dio.post(
        '/upload',
        data: formData,
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
        onSendProgress: (sent, total) {
          // 可以在这里添加更细粒度的进度更新
          debugPrint('分片 $chunkIndex 上传进度: $sent/$total');
        },
      );
      debugPrint('分片 $chunkIndex 上传响应: ${response.data}');

      // 返回响应数据
      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      debugPrint('分片 $chunkIndex 上传失败: $e');
      rethrow;
    }
  }
}

// Provider 定义
final uploadProvider = NotifierProvider<UploadNotifier, UploadState>(() {
  return UploadNotifier();
});

```

## Flutter 桌面端自定义拖拽文件

>
> 完整原理与踩坑记录见：[Flutter Windows 桌面：自定义拖拽 + 拖拽加密实战](./custom-drag-encryption)
> 已封装为插件：[win_drag_source](https://pub.dev/packages/win_drag_source)

Flutter 桌面端（Windows）用 `super_drag_and_drop` 拖文件出去时，OLE 会自动生成一个半透明的 ghost image（幽灵图像），和我们自己的拖拽预览叠加在一起很难看。下面这套方案用 FFI 直接驱动 Win32 OLE 的 `DoDragDrop`，绕开 ghost image，并支持把加密后的 payload（而非真实文件路径）投递给目标程序。

我把这套实现封装成了 **[win_drag_source](https://pub.dev/packages/win_drag_source)** 插件——纯 Dart FFI、无 native 代码，Windows 专用；在 macOS / Linux / Web 上 `DragSource` 会自动降级为普通 `Listener`，不触发拖拽。装上包就能用，不用再抄下面那一大坨 FFI 代码。

### 安装

```yaml
dependencies:
  win_drag_source: ^0.0.1
```

```bash
flutter pub get
```

### 用法

核心就一个 `DragSource` Widget，配合 `FilePayload`（文件）/ `TextPayload`（任意字符串）两种 payload。

**1. 拖拽真实文件（CF_HDROP）**——拖到资源管理器、文件夹就是复制文件：

```dart
import 'package:win_drag_source/win_drag_source.dart';

DragSource(
  payload: FilePayload('C:\\path\\to\\file.max'),
  onDropComplete: (accepted) {
    debugPrint('drop ${accepted ? 'accepted' : 'rejected'}');
  },
  child: YourCard(),
)
```

**2. 异步解析 payload**（查数据库、解密等耗时操作）：`payloadProvider` 优先级高于 `payload`。

```dart
DragSource(
  payloadProvider: () async {
    final path = await lookupFilePath(itemId);
    if (path == null) return null;
    return FilePayload(path);
  },
  onDropComplete: (ok) => ...,
  child: YourCard(),
)
```

**3. 拖拽加密 payload（CF_UNICODETEXT）**——把加密后的字符串当 payload，普通文件接收方不认，只有持密钥的目标程序能接收解密（见下文「拖拽加密」）。

```dart
DragSource(
  payload: TextPayload(encrypt(yourJson)),
  onDropComplete: (ok) => ...,
  child: YourCard(),
)
```

### 自定义 ghost image

默认会截取整个 `child` 作为拖拽预览。如果只想截某个子树（比如只截封面图，排除右下角的角标），给那棵子树套一个带 `GlobalKey` 的 `RepaintBoundary`，再把 key 传给 `imageKey`：

```dart
final _coverKey = GlobalKey();

@override
Widget build(BuildContext context) {
  return DragSource(
    payload: FilePayload(path),
    imageKey: _coverKey, // ← 只光栅化这棵子树，而不是整张卡片
    onDropComplete: (ok) => ...,
    child: Stack(
      children: [
        RepaintBoundary(
          key: _coverKey,
          child: Image.file(File(path)),
        ),
        Positioned(right: 8, bottom: 8, child: Badge()), // 不进入 ghost image
      ],
    ),
  );
}
```

### DragSource API

| 参数 | 类型 | 说明 |
|---|---|---|
| `child` | `Widget` | 被包裹的 widget，默认也是 ghost image 的截图源 |
| `payload` | `DragPayload?` | 同步 payload |
| `payloadProvider` | `Future<DragPayload?> Function()?` | 异步解析 payload，**优先级高于 `payload`** |
| `imageKey` | `GlobalKey?` | 指定光栅化哪棵子树作为 ghost image |
| `enabled` | `bool` | 总开关，默认 `true` |
| `onTap` | `VoidCallback?` | 单击回调 |
| `onDoubleTap` | `VoidCallback?` | 双击回调（注册后单击会延迟 500ms 派发，避免双击 = 两次单击） |
| `onDropComplete` | `ValueChanged<bool>?` | `DoDragDrop` 返回后回调，`true` = 目标接收了拖拽 |

payload 两种类型：

- `FilePayload(path)` → `CF_HDROP`，投递真实文件路径，资源管理器等通用。
- `TextPayload(text)` → `CF_UNICODETEXT`，投递任意字符串，需目标端按约定解析。

::: tip CF_HDROP vs CF_UNICODETEXT
- **CF_HDROP（文件）**：explorer、资源管理器等普通文件接收方都认，拖到文件夹就是复制文件。payload 是真实文件路径。
- **CF_UNICODETEXT（文本）**：把任意字符串当 payload。普通文件接收方**不认**，只有约定好的目标程序会接收并解密。适合「不想暴露真实路径」的场景。
- 两者可以在 `payloadProvider` 里按文件类型动态切换（白名单内走加密文本，否则走真实文件）。
:::

### 拖拽加密：AES-256-GCM + scrypt（应用层）

加密是**应用层**逻辑，不在插件里——你自己根据业务决定 payload 怎么编码。下面这版用 scrypt 派生密钥 + AES-256-GCM 加密，明文是 JSON（含文件路径），格式为 `iv_hex:authTag_hex:cipher_hex`，由持密钥的目标端（如 C++ 渲染器）按约定解密验签。

```dart
import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:pointycastle/export.dart';

/// 拖拽 payload 加密（AES-256-GCM + scrypt 派生密钥）。
/// 安全模型：AES-GCM tag 防篡改；不防路径泄露（path 在密文里）。
class DragPayloadCodec {
  DragPayloadCodec._();

  // ⚠️ 密钥已脱敏：实际项目里请用环境变量 / 编译期注入管理，
  //    不要硬编码进仓库；修改需同步改接收端（如 C++ 解密端）。
  static const String _kPassphrase = '<YOUR_PASSPHRASE>';
  static const String _kSalt = '<YOUR_SALT>';

  static const int _kScryptN = 16384;
  static const int _kScryptR = 8;
  static const int _kScryptP = 1;
  static const int _kKeyLength = 32; // AES-256
  static const int _kIvLength = 12;
  static const int _kTagLength = 16; // GCM-128 bit tag

  static Uint8List? _cachedKey;

  /// 加密为 `iv_hex:authTag_hex:cipher_hex`。
  /// 明文是 JSON `{"path": ..., "id": ..., "guid": ...}`，除 path 外均可选。
  static String encode({
    required String filePath,
    int? id,
    String? guid,
  }) {
    final key = _deriveKey();
    final iv = _randomBytes(_kIvLength);

    final json = jsonEncode({
      'path': filePath,
      if (id != null) 'id': id,
      if (guid != null) 'guid': guid,
    });
    final plain = Uint8List.fromList(utf8.encode(json));

    final cipher = GCMBlockCipher(AESEngine())
      ..init(true,
          AEADParameters(KeyParameter(key), _kTagLength * 8, iv, Uint8List(0)));
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
      ..init(ScryptParameters(
        _kScryptN, _kScryptR, _kScryptP, _kKeyLength,
        Uint8List.fromList(utf8.encode(_kSalt)),
      ));
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

接入 `DragSource` 时，在 `payloadProvider` 里按文件类型决定走加密文本还是真实文件：

```dart
DragSource(
  payloadProvider: () async {
    final path = await lookupFilePath(itemId);
    if (path == null) return null;
    // 白名单扩展名走加密 payload，否则原样拖文件
    if (DragPayloadCodec.shouldEncrypt(path)) {
      return TextPayload(DragPayloadCodec.encode(filePath: path, id: itemId));
    }
    return FilePayload(path);
  },
  onDropComplete: (ok) => ...,
  child: YourCard(),
)
```

::: warning 密钥安全
上面示例里的 `_kPassphrase` / `_kSalt` 已脱敏为占位符。实际项目里密钥应该：
1. 不要硬编码进源码仓库；
2. 通过编译期注入（`--dart-define`）或环境变量读取；
3. 修改密钥时必须同步改接收端（例如 C++ 解密端）。
:::

::: details 想看 FFI 原始实现？
插件内部的 `DoDragDrop` / `IDropSource` / `IDataObject` / 分层窗口等 FFI 实现细节，以及 ghost image 产生原因、跨进程 HGLOBAL 复制等踩坑记录，都整理在专题文章里：[Flutter Windows 桌面：自定义拖拽 + 拖拽加密实战](./custom-drag-encryption)。源码见插件仓库。
:::
```
