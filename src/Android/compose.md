
# jetpack Compose 学习

项目中有一些原生项目，flutter有时候需要使用原生方法，所以还是需要去学习一点原生。

## compose组件

### Row

1. **modifier:**  用于修改 Row 组件的外观和行为，例如设置大小、边距、背景颜色等。
2. **horizontalArrangement:** 控制子组件在水平方向上的排列方式，类似于 Flutter 中的 mainAxisAlignment。可选值有 Arrangement.Start（左对齐）、Arrangement.End（右对齐）、Arrangement.Center（居中对齐）、Arrangement.SpaceBetween（两端对齐）、Arrangement.SpaceAround 和 Arrangement.SpaceEvenly。
3. **verticalAlignment:** 控制子组件在垂直方向上的对齐方式，类似于 Flutter 中的 crossAxisAlignment。可选值有 Alignment.Top（顶部对齐）、Alignment.CenterVertically（居中对齐）和 Alignment.Bottom（底部对齐）。

```kt
Row(
    modifier = Modifier.padding(16.dp),
    verticalAlignment = Alignment.CenterVertically
) {
    //头像
    Image(
        painter = painterResource(id = R.drawable.ic_launcher_foreground),
        contentDescription = "这是一张图片",
        modifier = Modifier
            .size(100.dp)
            .clip(CircleShape)
            .border(1.5.dp, MaterialTheme.colorScheme.secondary, CircleShape)
    )
    Column {
        Text(text = "用户姓名")
        Text(text = "用户ID")
    }
}
```

### Column

1. **verticalArrangement:** 控制子组件在垂直方向（主轴）上的排列方式。可选值有：

* Arrangement.Top：子组件靠上排列，这是默认值。
* Arrangement.Bottom：子组件靠下排列。
* Arrangement.Center：子组件垂直居中排列。
* Arrangement.SpaceBetween：子组件两端对齐，组件之间间隔相等。
* Arrangement.SpaceAround：子组件周围间隔相等。
* Arrangement.SpaceEvenly：子组件之间和两端的间隔都相等。

1. **horizontalAlignment:**控制子组件在水平方向（交叉轴）上的对齐方式。可选值有：

* Alignment.Start：子组件左对齐。
* Alignment.End：子组件右对齐。
* Alignment.CenterHorizontally：子组件水平居中对齐。
* Alignment.Stretch：子组件在水平方向拉伸以填充 Column 的宽度。

```kt
Column {
    Text(text = "用户姓名")
    Text(text = "用户ID")
}
```

### TopAppBar

TopAppBar需要配合Scaffold中的topBar使用

```kt
Scaffold(
    topBar = {
        TopAppBar(
            // 使用 TopAppBarDefaults 来创建 TopAppBarColors 对象
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Color.Red, // 设置背景颜色
                titleContentColor = Color.White, // 设置标题文字颜色
                navigationIconContentColor = Color.White, // 设置导航图标颜色
                actionIconContentColor = Color.White // 设置操作图标颜色
            ),
            title = { Text(text = "基本 TopAppBar") }
        )
    }
) { innerPadding ->
    // 这里可以添加内容
}
```

### Scaffold、Drawer和bottomBar

```kt
val drawerState = rememberDrawerState(DrawerValue.Closed)//设置默认开启状态
val scope = rememberCoroutineScope()
val navigatorText = listOf("首页", "消息", "我的")
val navigatorIcon = listOf(Icons.Filled.Home, Icons.Filled.Build, Icons.Filled.Person)
var currentIndex by remember { mutableStateOf(0) }
ModalNavigationDrawer(
    drawerState = drawerState,
    drawerContent = { AppDrawContent() },
) {
//因为需要使用Drawer，所以需要使用ModalNavigationDrawer来包裹Scaffold
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                navigatorText.forEachIndexed { index, text ->
                    NavigationBarItem(
                        icon = { Icon(navigatorIcon[index], contentDescription = text) },
                        label = { Text(text) },
                        selected = currentIndex == index,
                        onClick = {
                            currentIndex = index
                        },
                        // 设置选中和未选中状态下的颜色
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color.Red, // 选中时图标的颜色
                            unselectedIconColor = Color.Gray, // 未选中时图标的颜色
                            selectedTextColor = Color.Red, // 选中时文字的颜色
                            unselectedTextColor = Color.Gray, // 未选中时文字的颜色
                            indicatorColor = Color.LightGray // 选中时的指示器颜色
                        ),
                    )
                }
            }
        },
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Blue, // 设置背景颜色
                    titleContentColor = Color.White, // 设置标题文字颜色
                    navigationIconContentColor = Color.White, // 设置导航图标颜色
                    actionIconContentColor = Color.White // 设置操作图标颜色
                ),
                title = { Text(text = "基本 Scaffold") },
                actions = {
                    Icon(Icons.Filled.Star, contentDescription = "Star")
                },
                navigationIcon = {
                    IconButton(onClick = {
                        scope.launch {
                            if (drawerState.isOpen) {
                                drawerState.close()
                            } else {
                                drawerState.open()
                            }
                        }
                    }) {
                        Icon(Icons.Filled.Menu, contentDescription = "Menu")
                    }
                }
            )
        },


        ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            BuildPage(index = currentIndex)
        }


    }
}
```

## exoplayer封装使用

自定义控制界面，可拖动、全屏切换。 倍速暂无
首先安装插件

```kt
 implementation (libs.androidx.media3.exoplayer)
```

**videoViewModel.kt**

```kt


class VideoViewModel : ViewModel() {

    private var _exoplayer: ExoPlayer? = null
    val exoplayer: ExoPlayer
        get() = _exoplayer ?: throw IllegalStateException("ExoPlayer未初始化")

    private val _isInitialized = MutableStateFlow(false)
    val isInitialized: StateFlow<Boolean> = _isInitialized
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying

    private val _isFullScreen = MutableStateFlow(false)
    val isFullScreen: StateFlow<Boolean> = _isFullScreen


    fun initPlayer(context: Context, videoUrl: String) {        // 同步初始化
        if (_exoplayer == null) {
            _exoplayer = ExoPlayer.Builder(context).build().apply {
                setMediaItem(MediaItem.fromUri(videoUrl.toUri()))
                prepare()
                play()
            }
            _isPlaying.value = true
            _exoplayer?.repeatMode = ExoPlayer.REPEAT_MODE_ONE
            _isInitialized.value = true
        } else {
            // ExoPlayer 已初始化，只需重新设置 URL 或其他必要参数
            _exoplayer?.setMediaItem(MediaItem.fromUri(videoUrl.toUri()))
            _exoplayer?.prepare()
            _exoplayer?.play()
        }
    }

    fun toggleFullScreen(context: Context) {
        _isFullScreen.value = !_isFullScreen.value
        setScreenOrientation(context)
    }


    fun play() {
        _exoplayer?.play()
        _isPlaying.value = true

    }

    fun pause() {
        _exoplayer?.pause()
        _isPlaying.value = false

    }

    override fun onCleared() {
        _exoplayer?.release()
        super.onCleared()


    }

    // 设置屏幕方向
    private fun setScreenOrientation(context: Context) {
        val activity = context as? Activity
        activity?.requestedOrientation = if (_isFullScreen.value) {
            ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        } else {
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
    }
}
```

**videoCompose组件**

```kt

@Composable
fun LandingVideo() {

    val context = LocalContext.current
    val viewModel: VideoViewModel = viewModel()
    val isInitialized by viewModel.isInitialized.collectAsState()
    val isFullScreen by viewModel.isFullScreen.collectAsState()
    // 使用 BackHandler 来监听返回按钮
    BackHandler(enabled = isFullScreen) {
        // 当是横屏状态时，切换回竖屏，而不是返回上一个界面
        viewModel.toggleFullScreen(context)
    }
    LaunchedEffect(isFullScreen) {
        val window = (context as? androidx.activity.ComponentActivity)?.window
        if (isFullScreen) {
            //兼容 Android 11+ 的新 API 写法
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window?.insetsController?.hide(WindowInsets.Type.systemBars())
                window?.insetsController?.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            } else {
                @Suppress("DEPRECATION")
                window!!.decorView.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_FULLSCREEN
                                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        )
            }
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window?.insetsController?.show(WindowInsets.Type.systemBars())
            } else {
                @Suppress("DEPRECATION")
                window?.decorView?.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_VISIBLE
            }
        }
    }
    // 根据全屏状态动态设置容器尺寸
    val modifier = if (isFullScreen) {
        Modifier
            .fillMaxSize()
            .background(Color.Black)
    } else {
        Modifier
            .fillMaxWidth()
            .height(220.dp)
            .statusBarsPadding()
            .background(Color.Black)
    }
    // 控制器状态
    var showControls by remember { mutableStateOf(true) }
    // 记录最后一次交互时间（毫秒）
    val lastInteractionTime = remember { mutableStateOf(System.currentTimeMillis()) }

    LaunchedEffect(lastInteractionTime.value) {
        // 每当交互时间更新时，判断是否隐藏控制器
        delay(6000)
        if (System.currentTimeMillis() - lastInteractionTime.value >= 6000L) {
            showControls = false
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(220.dp)
            .statusBarsPadding()
            .background(Color.Black)

    ) {

        AndroidView(
            modifier = Modifier
                .fillMaxSize()
                .align(Alignment.Center),
            factory = { ctx ->
                val playerView = PlayerView(ctx).apply {
                    useController = false
                    // 禁止原生控件拦截点击事件
                    isClickable = false
                }
                viewModel.initPlayer(
                    ctx,
                    "http://cdnwm.yuluojishu.com/20250317/b9239f4742a409e2367dfcb846c0089b.mp4"
                )
                playerView.player = viewModel.exoplayer
                playerView
            }
        )
        // 透明点击层，拦截点击事件
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = {
                            // 每次点击都显示控制器并更新时间
                            showControls = true
                            lastInteractionTime.value = System.currentTimeMillis()
                        }
                    )
                }
        ) {
            //控制器
            if (isInitialized && showControls) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .height(30.dp)
                        .background(Color.Black.copy(alpha = 0.5f))
                        .zIndex(1f),
                ) {


                    CustomPlayerControls(
                        isFullScreen = isFullScreen,
                        toggleFullScreen = { viewModel.toggleFullScreen(context) },
                        player = viewModel.exoplayer,
                        onPlayPause = {
                            if (viewModel.isPlaying.value) {
                                viewModel.pause()
                            } else {
                                viewModel.play()
                            }
                            // 每次操作都更新最后交互时间，重新计时隐藏
                            lastInteractionTime.value = System.currentTimeMillis()
                            showControls = true
                        },
                        onSeekChange = {
                            viewModel.exoplayer.seekTo(it)
                            // 每次操作都更新最后交互时间，重新计时隐藏
                            lastInteractionTime.value = System.currentTimeMillis()
                            showControls = true
                        },
                        onSeekComplete = {
                            viewModel.exoplayer.play()
                            // 每次操作都更新最后交互时间，重新计时隐藏
                            lastInteractionTime.value = System.currentTimeMillis()
                            showControls = true
                        }
                    )
                }
            }
        }

    }

}

```

自定义控制界面<br/>
CustomPlayerControls.kt

```kt
@OptIn(UnstableApi::class)
@Composable
fun CustomPlayerControls(
    isFullScreen: Boolean,
    toggleFullScreen: () -> Unit,
    player: Player,
    onPlayPause: () -> Unit,
    onSeekChange: (Long) -> Unit,
    onSeekComplete: () -> Unit
) {
    // 是否正在拖动进度条
    var isSeeking by remember { mutableStateOf(false) }
    // 当前播放进度（毫秒）
    var currentPosition by remember { mutableStateOf(player.currentPosition) }
    // 获取总时长，若无效则设为 0
    var bufferedPosition by remember { mutableStateOf(0L) }
    var totalDuration by remember { mutableStateOf(0L) }
    var wasPlayingBeforeSeek by remember { mutableStateOf(false) }
    // 播放器是否已准备好
    var isReady by remember { mutableStateOf(false) }
    // 监听播放器状态和进度变化，合并到一个监听器中
    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
                if (playbackState == Player.STATE_READY && !isReady) {
                    isReady = true
                }
            }

            override fun onEvents(player: Player, events: Player.Events) {
                bufferedPosition = player.bufferedPosition
                totalDuration = player.duration.coerceAtLeast(1)
                if (!isSeeking) {

                    currentPosition = player.currentPosition
                }
            }
        }
        player.addListener(listener)
        onDispose {
            player.removeListener(listener)
        }
    }
    LaunchedEffect(player) {
        // 在此添加进度更新逻辑，确保控件显示时也会更新
        while (true) {
            if (player.isPlaying && !isSeeking) {
                currentPosition = player.currentPosition
                bufferedPosition = player.bufferedPosition
                totalDuration = player.duration.coerceAtLeast(1)
            }
            delay(1000)  // 每秒更新进度
        }
    }

    // 当播放器未准备好时，不渲染控制器
//    if (!isReady) return

    Row(
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp)

    ) {
        IosStyleProgressSlider(
            currentPosition = currentPosition,
            bufferedPosition = bufferedPosition,
            totalDuration = totalDuration,
            onSeekChanged = { position ->
                // 记录拖动前的播放状态
                wasPlayingBeforeSeek = player.isPlaying
                if (player.isPlaying) {
                    player.pause() // 拖动时暂停播放
                }
                onSeekChange(position)
            },
            onSeekStart = {
                wasPlayingBeforeSeek = player.isPlaying
                if (player.isPlaying) player.pause()
            },
            onSeekEnd = {
                // 拖动结束后恢复播放状态
                if (wasPlayingBeforeSeek) {
                    player.play()
                }
                onSeekComplete()
            },
            modifier = Modifier
                .weight(1f)
                .padding(end = 12.dp)
        )
        Text(text = formatTime(currentPosition), color = Color.White, fontSize = 12.sp)
        Text(text = "/${formatTime(totalDuration)}", color = Color.White, fontSize = 12.sp)
        // 播放暂停按钮
        IconButton(
            onClick = onPlayPause
        ) {
            Icon(
                painter = if (player.isPlaying) painterResource(id = R.drawable.ic_pause_icon) else painterResource(
                    id = R.drawable.ic_play_icon
                ),
                tint = Color.White,
                contentDescription = "播放/暂停"
            )
        }
        // 全屏按钮
        IconButton(
            onClick = toggleFullScreen,
            modifier = Modifier
        ) {
            Icon(
                painter = if (isFullScreen) painterResource(id = R.drawable.ic_fullscreen_false) else painterResource(
                    id = R.drawable.ic_fullscreen_true
                ),
                contentDescription = "全屏",
                tint = Color.White
            )
        }
    }
}


@SuppressLint("DefaultLocale")
private fun formatTime(milliseconds: Long): String {
    val seconds = (milliseconds / 1000).toInt()
    return String.format("%02d:%02d", seconds / 60, seconds % 60)
}

@Composable
fun IosStyleProgressSlider(
    currentPosition: Long,
    bufferedPosition: Long,
    totalDuration: Long,
    onSeekStart: () -> Unit, // 新增拖动开始回调
    onSeekEnd: () -> Unit,   // 新增拖动结束回调
    onSeekChanged: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    // 进度条参数配置
    val trackHeight = 4.dp
    val thumbRadius = 6.dp
    val activeColor = Color.White.copy(alpha = 0.8f)
    val bufferedColor = Color.LightGray.copy(alpha = 0.6f)
    val backgroundColor = Color.DarkGray.copy(alpha = 0.4f)

    var isDragging by remember { mutableStateOf(false) }
    val sliderWidth = remember { mutableStateOf(0f) }

    Box(
        modifier = modifier
            .height(40.dp)
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    onSeekStart() // 拖动开始
                    val newPosition = (offset.x / sliderWidth.value * totalDuration).toLong()
                    onSeekChanged(newPosition.coerceIn(0, totalDuration))
                    onSeekEnd() // 拖动结束
                }
            }
    ) {
        // 绘制底层背景
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(trackHeight)
                .align(Alignment.Center)
        ) {
            sliderWidth.value = size.width

            // 绘制背景轨道
            drawRoundRect(
                color = backgroundColor,
                cornerRadius = CornerRadius(2.dp.toPx())
            )

            // 绘制缓冲进度
            val bufferedPercent = bufferedPosition.toFloat() / totalDuration
            drawRoundRect(
                color = bufferedColor,
                cornerRadius = CornerRadius(2.dp.toPx()),
                size = Size(size.width * bufferedPercent, size.height)
            )

            // 绘制当前进度
            val progressPercent = currentPosition.toFloat() / totalDuration
            drawRoundRect(
                color = activeColor,
                cornerRadius = CornerRadius(2.dp.toPx()),
                size = Size(size.width * progressPercent, size.height)
            )
        }

        // 绘制圆形滑块
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = {
                            isDragging = true
                            onSeekStart() // 拖动开始
                        },
                        onDragEnd = {
                            isDragging = false
                            onSeekEnd()  // 拖动结束
                        }
                    ) { change, _ ->
                        val newPosition = (change.position.x / sliderWidth.value * totalDuration)
                            .toLong()
                        onSeekChanged(newPosition.coerceIn(0, totalDuration))
                    }
                }
        ) {
            val progressPercent = currentPosition.toFloat() / totalDuration
            val thumbX = size.width * progressPercent

            drawCircle(
                color = activeColor,
                radius = thumbRadius.toPx(),
                center = Offset(thumbX, center.y)
            )

            if (isDragging) {
                drawCircle(
                    color = activeColor.copy(alpha = 0.2f),
                    radius = thumbRadius.toPx() * 2,
                    center = Offset(thumbX, center.y)
                )
            }
        }
    }
}

```

## 安卓多渠道打包

1. build.gradle.kts中配置

```kt
productFlavors {//多渠道信息
    create("oppo") {
        dimension = "none"
        applicationId = "com.baidu.www"
        versionCode = 1010
        versionName = "1.0.1"
        manifestPlaceholders["APP_NAME"] = "百度"
        manifestPlaceholders["APP_ICON"] = "@mipmap/ic_launcher"
        signingConfig = signingConfigs.getByName("keyStoreRelease")
    }
}
buildTypes {//打正式包的配置信息
    release {
        isMinifyEnabled = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
        signingConfig = signingConfigs.getByName("keyStoreRelease")
        ndk {
            // noinspection ChromeOsAbiSupport
            abiFilters += listOf("armeabi-v7a","arm64-v8a")
        }
    }
}
buildFeatures {
    compose = true
    buildConfig = true//这个是生成配置信息 方便我们在代码里去获取渠道信息
}
//开启上面 生成的数据
public final class BuildConfig {
  public static final boolean DEBUG = Boolean.parseBoolean("true");
  public static final String APPLICATION_ID = "com.baidu.www";
  public static final String BUILD_TYPE = "debug";
  public static final String FLAVOR = "oppo";
  public static final int VERSION_CODE = 1010;
  public static final String VERSION_NAME = "1.0.1";
}

//打包输出文件名就是对应的渠道名字
applicationVariants.all {
    outputs.all {
        if (this is com.android.build.gradle.internal.api.ApkVariantOutputImpl) {
            outputFileName = "${flavorName}.apk"
        }
    }
}
```

2. fest,xml文件配置

```xml
<application

    android:allowBackup="true"
    android:usesCleartextTraffic="true"
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:fullBackupContent="@xml/backup_rules"
    android:icon="${APP_ICON}"//图标
    android:label="${APP_NAME}"//app名字
    android:roundIcon="${APP_ICON}"
    android:supportsRtl="true"
    android:theme="@style/Theme.Test_compose"
    tools:targetApi="31">
    <activity
        android:name=".MainActivity"
        android:exported="true"
        android:label="${APP_NAME}"
        android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize"
        android:screenOrientation="portrait"
        android:theme="@style/Theme.Test_compose">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />

            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

3. 使用渠道信息

```kt
const val CHANNEL = BuildConfig.CHANNEL
```

4. 打包的时候就点击右侧gradle/app/other/assemble开头的，选择对应渠道Release

## 安卓跳转微信小程序

### 安装微信SDK

```kt
 implementation(libs.wechat.sdk.android)//微信SDK
```

### 微信跳转工具封装

```kt
object WeChatUtils {
    private var mApi: IWXAPI? = null

    //初始化
    fun init(appId: String) {
        print("初始化微信：$appId")
        if (appId.isEmpty()) return
        val api = WXAPIFactory.createWXAPI(
            MyAppConfig.getConfig<Context>(MyAppConfig.Keys.APPLICATION),
            appId,
            false
        )
        api.registerApp(appId)
        mApi = api
    }

    //判断是否安装微信
    fun getApi(): IWXAPI? {
        val api = mApi
        if (api == null) {
            print("初始化失败")
        } else if (!api.isWXAppInstalled) {
            print("未安装微信")
        }
        return api
    }

    fun jumpWxMiniProgram(
        courseId: Int
    ) {
        getApi()?.let {
            val miniProgramId = AppRuntime.initConfig?.wxMiniProgramId ?: ""
            val miniProgramPath = AppRuntime.initConfig?.wxMiniProgramPath ?: ""
            val realPath = "${miniProgramPath}?token=${
                AccountManager.getInstance().getToken()
            }&video_id=${courseId}"
            print("跳转微信小程序：$realPath")
            val req = WXLaunchMiniProgram.Req()
            req.userName = miniProgramId
            req.path = realPath
            req.miniprogramType = WXLaunchMiniProgram.Req.MINIPTOGRAM_TYPE_RELEASE
            it.sendReq(req)
        }
    }
}
```

### 注册使用

```kt
//初始化
WeChatUtils.init(it.initConfig?.wxPayAppId ?: "")
//使用 ---跳转微信小程序
WeChatUtils.jumpWxMiniProgram( landingPageInfo?.courseId ?: 0)
```

### 从小程序返回App

```kt
//fest.xml 新增
<activity
    android:name=".wxapi.WXEntryActivity"
    android:exported="true"
    android:launchMode="singleTask"
    android:taskAffinity="${applicationId}" />
<activity-alias
    android:name="${applicationId}.wxapi.WXEntryActivity"
    android:exported="true"
    android:launchMode="singleTask"
    android:targetActivity=".wxapi.WXEntryActivity"
    />
//然后在项目目录下新增wxapi/WXEntryActivity.kt文件
class WXEntryActivity : ComponentActivity(), IWXAPIEventHandler {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WeChatUtils.getApi()?.handleIntent(intent, this)
    }
    override fun onNewIntent(intent: Intent, caller: ComponentCaller) {
        super.onNewIntent(intent, caller)
        setIntent(intent)
        WeChatUtils.getApi()?.handleIntent(intent, this)
    }

    override fun onReq(req: BaseReq?) {
        println("WXEntryActivity onReq")
    }

    override fun onResp(resp: BaseResp?) {
        resp ?: return

        println("WXEntryActivity errStr = ${resp.errStr} errCode = ${resp.errCode}")
        finish()
    }
}

```

### 注意项

如何当前应用的包名和小程序配置的包名不一致的话会提示签名配置不一致，需要检查包名和配置。<br/>
如果包名和小程序配置都没有问题的话，请检查build.gradle.kts 中 buildTypes 中 debug和release中的signingConfig配置是否正确。

## APP跳转微信获客链接

```kt
fun jumpWxCustomerLink(customerLink: String) {
    val context = MyAppConfig.getConfig<Context>(MyAppConfig.Keys.APPLICATION)//此次是context ，也可以传进来
    val intent = Intent(Intent.ACTION_VIEW, customerLink.toUri()).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    context.startActivity(intent)
}
```
