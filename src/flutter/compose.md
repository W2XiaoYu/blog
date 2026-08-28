
# Jetpack Compose 学习笔记

Flutter 项目走到原生能力时，最终还是会碰到 Android。与其每次只抄一段桥接代码，不如把 Compose、协程和数据层顺着学一遍，也能更从容地读懂插件背后的实现。

这份笔记按下面几条线整理：

* 一、[Compose 基础](#一compose-基础)：布局组件、Modifier、状态管理、动画、导航、主题
* 二、[Kotlin 协程](#二kotlin-协程)：协程基础、Flow 流
* 三、[数据层](#三数据层)：Retrofit 网络、Room 数据库、DataStore 存储
* 四、[项目架构（MVVM）](#四项目架构mvvm)：ViewModel、Repository、依赖注入
* 五、[Android 工程实践](#五android-工程实践)：ExoPlayer、多渠道打包、微信跳转

## 一、Compose 基础

### 布局与组件

#### Row

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

#### Column

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

#### TopAppBar

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

#### Scaffold、Drawer 和 BottomBar

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

### Modifier 布局系统详解

Modifier 是 Compose 修改组件外观和行为的链式 API，几乎每个组件的第一个参数都是它。用法是把多个 modifier 用 `.` 串起来：

```kt
Text(
    text = "Hello",
    modifier = Modifier
        .fillMaxWidth()          // 尺寸
        .padding(16.dp)          // 内边距
        .background(Color.Blue)  // 背景
        .clickable { }           // 点击
)
```

#### 常用 Modifier 分类

**尺寸：**

```kt
Modifier.size(100.dp)                                  // 固定宽高
Modifier.size(width = 100.dp, height = 50.dp)          // 指定宽高
Modifier.fillMaxSize()                                 // 填满父布局
Modifier.fillMaxWidth(0.5f)                            // 填满父布局 50% 宽度
Modifier.widthIn(min = 50.dp, max = 200.dp)            // 限制宽度范围
Modifier.requiredSize(100.dp)                          // 强制尺寸，忽略父布局约束
Modifier.aspectRatio(1f)                               // 按宽高比（1f 正方形）
```

**布局（padding / offset / weight）：**

```kt
Modifier.padding(16.dp)                                // 四周内边距
Modifier.padding(start = 16.dp, end = 8.dp)            // 指定方向
Modifier.offset(x = 8.dp, y = 4.dp)                    // 偏移，不影响测量
Modifier.weight(1f)                                    // 只在 Row/Column 里生效，按比例分剩余空间
Modifier.align(Alignment.Center)                       // 在 Box/Row/Column 作用域里对齐
```

**装饰（背景 / 边框 / 阴影）：**

```kt
Modifier.background(Color.Red)                                            // 纯色背景
Modifier.background(Brush.linearGradient(listOf(Color.Red, Color.Blue)))  // 渐变背景
Modifier.border(1.dp, Color.Red)                                          // 边框
Modifier.border(1.dp, Color.Red, RoundedCornerShape(8.dp))                // 圆角边框
Modifier.shadow(4.dp, RoundedCornerShape(8.dp))                           // 阴影，配 shape 才有圆角效果
```

**裁剪：**

```kt
Modifier.clip(CircleShape)                   // 裁成圆形（头像常用）
Modifier.clip(RoundedCornerShape(8.dp))      // 裁成圆角
// 先裁剪再设置背景，背景也会跟着被裁
```

**点击与手势：**

```kt
Modifier.clickable { }                                       // 普通点击
Modifier.combinedClickable(onClick = { }, onLongClick = { }) // 点击+长按，需要 @OptIn(ExperimentalFoundationApi::class)
Modifier.pointerInput(Unit) { detectTapGestures(...) }       // 高级手势，播放器进度条拖动就是用它
```

**其他常用：**

```kt
Modifier.alpha(0.5f)      // 透明度
Modifier.rotate(45f)      // 旋转
Modifier.scale(1.5f)      // 缩放
Modifier.zIndex(1f)       // 层级，数值大的在上面
Modifier.testTag("tag")   // 测试标识
```

#### 顺序敏感

Modifier 链**顺序不同效果不同**，最典型的是 padding 和 background 的顺序：

```kt
// 先 padding 再 background：背景在 padding 外层，padding 区域不显示背景
Modifier
    .padding(8.dp)
    .background(Color.Red)

// 先 background 再 padding：背景包含 padding 区域，整个组件变大
Modifier
    .background(Color.Red)
    .padding(8.dp)
```

画分隔线时也容易踩坑：`Modifier.padding(vertical = 8.dp).background(...)` 会让整块都带上背景。正确做法是只给一侧 padding，或者用 `drawBehind` 画线不影响布局。

#### 自定义 Modifier

重复使用的 modifier 组合可以抽成扩展函数：

```kt
fun Modifier.cardStyle(): Modifier = this
    .clip(RoundedCornerShape(12.dp))
    .background(Color.White)
    .border(1.dp, Color.LightGray, RoundedCornerShape(12.dp))
    .padding(16.dp)

// 使用
Text("内容", modifier = Modifier.cardStyle())
```

> 想画背景但不影响测量布局，用 `Modifier.drawBehind { drawRoundRect(...) }`；想完全自定义绘制内容用 `Modifier.drawWithContent`。

### 状态管理

#### remember 与 mutableStateOf

Compose 的界面状态用 `mutableStateOf` 创建，配合 `remember` 在重组时保留：

```kt
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("点击了 $count 次")
    }
}
```

> `by` 是 Kotlin 的属性委托语法，需要 `import androidx.compose.runtime.getValue` 和 `import androidx.compose.runtime.setValue`。

#### rememberSaveable

`remember` 只保证重组时保留，旋转屏幕或进程被回收（如系统杀后台）后会丢失。需要跨配置变更保留的状态用 `rememberSaveable`：

```kt
var count by rememberSaveable { mutableStateOf(0) }
```

普通类型（String、Int、基本数据类型）开箱即用；自定义类型需要能被 `Bundle` 保存，否则要传 `saver`。

#### derivedStateOf 派生状态

由已有状态计算出来的状态，用 `derivedStateOf` 包裹，只有计算结果真正变化时才触发重组：

```kt
val list = remember { mutableStateListOf<String>() }
val hasItem by remember { derivedStateOf { list.isNotEmpty() } }
```

#### 状态提升

子组件不应该直接持有父组件也要用的状态，把状态提升到父组件，子组件通过参数和回调来读写：

```kt
@Composable
fun Parent() {
    var text by remember { mutableStateOf("") }
    Child(text = text, onTextChange = { text = it })
}

@Composable
fun Child(text: String, onTextChange: (String) -> Unit) {
    OutlinedTextField(
        value = text,
        onValueChange = onTextChange
    )
}
```

#### ViewModel + StateFlow

状态较多、需要跨页面共享时放到 ViewModel，用 `StateFlow` 对外暴露，界面用 `collectAsState` 收集：

```kt
class MainViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count

    fun add() {
        _count.value++
    }
}

@Composable
fun CounterScreen(viewModel: MainViewModel = viewModel()) {
    val count by viewModel.count.collectAsState()

    Button(onClick = { viewModel.add() }) {
        Text("当前值：$count")
    }
}
```

### 副作用

组合函数要求"无副作用"，但有些操作必须发生在组合过程中，这些统一叫副作用（Side Effect）：

**LaunchedEffect**：进入组合时启动协程，key 变化时取消并重启，适合延时、轮询、一次性初始化：

```kt
LaunchedEffect(key1) {
    // 这里是协程作用域，可以调用挂起函数
    delay(1000)
    // key1 变化时，这个协程会被取消并重新执行
}
```

**DisposableEffect**：需要释放资源时使用，`onDispose` 在离开组合时回调，适合注册/反注册监听器：

```kt
DisposableEffect(Unit) {
    val listener = MyListener()
    register(listener)
    onDispose {
        unregister(listener)
    }
}
```

**rememberCoroutineScope**：在组合函数外（比如点击回调）启动协程：

```kt
val scope = rememberCoroutineScope()
Button(onClick = {
    scope.launch {
        // 做一些异步操作
    }
}) {
    Text("启动协程")
}
```

### LazyColumn 列表

列表用 `LazyColumn`（类似 Flutter 的 ListView.builder），只组合可见项，性能好：

```kt
@Composable
fun MessageList(messages: List<String>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 单个 item，可用于头部
        item {
            Text("消息列表", style = MaterialTheme.typography.titleLarge)
        }

        // 遍历列表，key 给每一项唯一标识，防止列表变化时复用错乱
        items(
            items = messages,
            key = { it }
        ) { message ->
            MessageItem(message)
        }
    }
}

@Composable
fun MessageItem(message: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = message,
            modifier = Modifier.padding(16.dp)
        )
    }
}
```

需要索引时用 `itemsIndexed`；横向列表用 `LazyRow`；需要吸顶头部用 `stickyHeader`（配合 `@OptIn(ExperimentalFoundationApi::class)`）。

滚动控制：`rememberLazyListState` 配合 `animateScrollToItem`：

```kt
val listState = rememberLazyListState()
val scope = rememberCoroutineScope()

LazyColumn(state = listState) { ... }

// 点击按钮滚动到底部
scope.launch {
    listState.animateScrollToItem(messages.size - 1)
}
```

### TextField 输入框

Material3 提供 `TextField`（填充样式）和 `OutlinedTextField`（描边样式）：

```kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginForm() {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = username,
        onValueChange = { username = it },
        label = { Text("用户名") },
        placeholder = { Text("请输入用户名") },
        singleLine = true,
        leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null) },
        modifier = Modifier.fillMaxWidth()
    )

    OutlinedTextField(
        value = password,
        onValueChange = { password = it },
        label = { Text("密码") },
        singleLine = true,
        // 密码类型：隐藏输入内容
        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
        // 右侧小眼睛切换明文/密文
        trailingIcon = {
            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                Icon(
                    imageVector = if (passwordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                    contentDescription = if (passwordVisible) "隐藏密码" else "显示密码"
                )
            }
        },
        modifier = Modifier.fillMaxWidth()
    )
}
```

### 对话框

**AlertDialog** 确认弹窗：

```kt
@Composable
fun ConfirmDialog(
    show: Boolean,
    title: String,
    content: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (show) {
        AlertDialog(
            onDismissRequest = onDismiss, // 点击遮罩或返回键
            title = { Text(title) },
            text = { Text(content) },
            confirmButton = {
                TextButton(onClick = onConfirm) { Text("确定") }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) { Text("取消") }
            }
        )
    }
}
```

**ModalBottomSheet** 底部弹窗（Material3，需要 `@OptIn(ExperimentalMaterial3Api::class)`）：

```kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShareSheet(show: Boolean, onDismiss: () -> Unit) {
    if (show) {
        ModalBottomSheet(onDismissRequest = onDismiss) {
            Column(modifier = Modifier.padding(bottom = 32.dp)) {
                Text("分享到", modifier = Modifier.padding(16.dp))
                // 自定义内容
            }
        }
    }
}
```

### 动画

**AnimatedVisibility** 显隐动画：

```kt
AnimatedVisibility(
    visible = expanded,
    enter = fadeIn() + expandVertically(),
    exit = fadeOut() + shrinkVertically()
) {
    Text("展开的内容")
}
```

**animate\*AsState** 数值动画，状态变化时自动补间：

```kt
@Composable
fun ExpandableItem() {
    var expanded by remember { mutableStateOf(false) }

    // 箭头旋转动画
    val rotation by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = tween(300),
        label = "rotation"
    )

    TextButton(onClick = { expanded = !expanded }) {
        Icon(
            imageVector = Icons.Filled.ExpandMore,
            contentDescription = null,
            modifier = Modifier.rotate(rotation)
        )
        Text(if (expanded) "收起" else "展开")
    }
}
```

常用的还有：`animateColorAsState`（颜色渐变）、`animateDpAsState`（尺寸变化）、`animateContentSize`（内容尺寸变化自动动画）。

### Navigation 导航

多页面导航推荐用 Navigation Compose，gradle 引入：

```kt
implementation(libs.androidx.navigation.compose)
```

```kt
@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onOpenDetail = { id ->
                    navController.navigate("detail/$id")
                }
            )
        }

        // 带参数的路由，参数名用 { } 占位
        composable(
            route = "detail/{id}",
            arguments = listOf(navArgument("id") { type = NavType.IntType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id") ?: 0
            DetailScreen(id = id)
        }
    }
}
```

常用操作：

```kt
// 返回上一页
navController.popBackStack()

// 跳转并清空返回栈，防止按返回键回到登录页
navController.navigate("home") {
    popUpTo("login") { inclusive = true }
}
```

### 主题切换（暗色模式）

根据系统主题自动切换：

```kt
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = Color(0xFF90CAF9),
            secondary = Color(0xFFCE93D8)
        )
    } else {
        lightColorScheme(
            primary = Color(0xFF1E88E5),
            secondary = Color(0xFF8E24AA)
        )
    }
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
```

手动切换并记住选择（配合 DataStore 持久化见 [数据层](#三数据层)）：

```kt
var darkMode by rememberSaveable { mutableStateOf(false) }

AppTheme(darkTheme = darkMode) {
    // 应用内容
}

Switch(
    checked = darkMode,
    onCheckedChange = { darkMode = it }
)
```

### 自定义 Tab

1、封装tabROw

```kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScrollableTabRow(
    modifier: Modifier = Modifier,
    tabs: List<String>,
    selectedIndex: Int,
    tabPadding: Dp = 8.dp,
    onTabSelected: (Int) -> Unit
) {
    val density = LocalDensity.current
    val tabWidths = remember { mutableStateListOf<Int>() }
    val indicatorOffsetX = remember { Animatable(0f) }
    val indicatorWidth = remember { Animatable(0f) }
    val scrollState = rememberScrollState()
    LaunchedEffect(selectedIndex, tabWidths) {
        if (tabWidths.size > selectedIndex) {
            // 计算选中的 tab 左侧所有 tab 的宽度累加值（包括 padding）
            val offset = tabWidths.take(selectedIndex)
                .sum() + with(density) { tabPadding.roundToPx() } * selectedIndex * 2
            // 计算选中 tab 的宽度（加上 padding）
            val width = tabWidths[selectedIndex]

            indicatorOffsetX.animateTo(offset.toFloat(), tween(250))
            indicatorWidth.animateTo(width.toFloat(), tween(250))
        }
    }
    Box(
        modifier = modifier.padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier
                .horizontalScroll(scrollState)

        ) {
            tabs.forEachIndexed { index, tab ->
                Text(
                    text = tab,
                    modifier = Modifier
                        .padding(horizontal = tabPadding, vertical = 12.dp) // 包裹 Text 外
                        .onGloballyPositioned() {
                            val width = it.size.width
                            if (tabWidths.size <= index) {
                                tabWidths.add(width)
                            } else {
                                tabWidths[index] = width
                            }
                        }
                        .clickable() {
                            onTabSelected(index)
                        },
                    color = if (index == selectedIndex) Color.Black else Color.Gray,
                    fontWeight = if (index == selectedIndex) FontWeight.Bold else FontWeight.Normal
                )
            }

        }
        Box(
            modifier = Modifier
                .offset {
                    println(indicatorOffsetX.value.toInt())
                    IntOffset(
                        indicatorOffsetX.value.toInt() + with(density) { tabPadding.roundToPx() },
                        0
                    )
                } // 加 padding 修正
                .padding(top = 42.dp)
                .width(with(density) { indicatorWidth.value.toDp() })
                .height(2.dp)
                .background(Color.Red) // 可替换为你的 indicatorColor
        )
    }

}
```

2、使用

```kt
@Composable
fun MainLayout(

) {
    var selectedIndex by remember { mutableStateOf(0) }
    val tabs = stringArrayResource(id = R.array.home_tabs).toList();
    val pagerState = rememberPagerState(
        initialPage = selectedIndex,
        initialPageOffsetFraction = 0f,
        pageCount = { tabs.size }
    )
    LaunchedEffect(pagerState.currentPage) {
        if (selectedIndex != pagerState.currentPage) {
            selectedIndex = pagerState.currentPage
        }

    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(WindowInsets.statusBars.asPaddingValues())

    ) {

        ScrollableTabRow(
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .background(Color.White),
            tabs = tabs,
            selectedIndex = selectedIndex,
            onTabSelected = { index ->
                selectedIndex = index

            }
        )
        Spacer(modifier = Modifier.height(1.dp))
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) {
            when (selectedIndex) {
                0 -> HomeScreen("关注")
                1 -> HomeScreen("发现")
                2 -> HomeScreen("同城")
            }
        }

    }
}
```

## 二、Kotlin 协程

协程（Coroutine）是 Kotlin 的轻量级并发方案，用来解决线程切换和回调地狱。它本质上是**挂起/恢复**：执行到挂起函数时让出线程，数据准备好后再回到原线程继续执行，整个过程不阻塞任何线程。

### 基础用法

挂起函数（`suspend` 修饰）是协程的核心，它只能在协程作用域或另一个挂起函数里调用：

```kt
// 在协程里调用挂起函数，网络请求不阻塞主线程
viewModelScope.launch {
    val user = api.getUser() // suspend 函数
    tvName.text = user.name // 请求完成后回到主线程更新 UI
}
```

启动协程的几种作用域：

* `viewModelScope`：ViewModel 里用，销毁自动取消
* `lifecycleScope`：Activity/Fragment 里用，销毁自动取消
* `rememberCoroutineScope`：Compose 里在回调中启动协程
* `GlobalScope`：**别用**，跟谁的生命周期都没绑定，容易泄漏

### 调度器 Dispatchers

协程跑在哪个线程由调度器决定：

* `Dispatchers.Main`：主线程，更新 UI
* `Dispatchers.IO`：IO 操作（网络、文件、数据库）
* `Dispatchers.Default`：CPU 密集计算（排序、解析）
* `Dispatchers.Unconfined`：不限制，很少用

用 `withContext` 切换线程并返回结果：

```kt
viewModelScope.launch {
    // 默认在主线程
    val result = withContext(Dispatchers.IO) {
        // 切到 IO 线程做耗时操作
        heavyWork()
    }
    // 自动切回主线程
    tvResult.text = result
}
```

`withContext` 是挂起函数，会等块内执行完再返回，执行完自动切回原来的线程。

### launch 与 async

* `launch`：启动协程，无返回值，适合"干一件事"
* `async`：启动协程并返回 `Deferred`，用 `await()` 拿结果，适合"取返回值"和并发

```kt
// 并发请求两个接口，总耗时取最慢的那个
viewModelScope.launch {
    val user = async { api.getUser() }     // 并发开始
    val detail = async { api.getDetail() } // 并发开始
    val userData = user.await()
    val detailData = detail.await()
    // 两个都完成后才继续
}
```

### 结构化并发与取消

协程是结构化并发的：**父协程取消，所有子协程跟着取消**。

```kt
val job = viewModelScope.launch {
    repeat(1000) {
        delay(1000)
        println("tick $it")
    }
}
// 主动取消
job.cancel()
```

挂起函数（`delay`、网络请求等）会自动响应取消；但**纯 CPU 计算不会**，需要手动检查：

```kt
viewModelScope.launch {
    for (i in 0..100_000) {
        // 协程被取消时抛 CancellationException，跳出循环
        ensureActive()
        heavyCompute(i)
    }
}
```

取消后的清理工作放 `finally`，注意取消状态下不能再调用普通挂起函数，要用 `withContext(NonCancellable)`：

```kt
try {
    ...
} finally {
    withContext(NonCancellable) {
        // 关闭文件、释放资源
        close()
    }
}
```

### Job 与 SupervisorJob

默认父子协程互相影响：子协程抛异常会连累父协程。用 `SupervisorJob` 让子协程失败互不影响：

```kt
// 一个子协程失败，不影响其他兄弟协程
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
scope.launch { work1() }
scope.launch { work2() } // work1 失败，work2 继续跑
```

> `viewModelScope` 内部就是 `SupervisorJob() + Dispatchers.Main.immediate`，所以 ViewModel 里一个任务失败不会影响其他任务。

### Flow 流

`Flow` 是协程版的响应式流（类似 RxJava），用于处理**多个值的异步数据**（列表、搜索输入、数据库查询）。

**冷流**：只有 `collect` 的时候才开始执行，每次 collect 都重新执行一遍：

```kt
val flow = flow {
    emit(1)
    emit(2)
    emit(3)
}

// collect 时才开始执行
scope.launch {
    flow.collect { value ->
        println(value)
    }
}
```

**常用操作符**（和 RxJava 类似）：

```kt
flowOf(1, 2, 3, 4)
    .filter { it % 2 == 0 }        // 过滤
    .map { it * 10 }               // 转换
    .take(2)                       // 只取前 N 个
    .distinctUntilChanged()        // 去掉连续重复的值
    .onEach { println(it) }        // 对每个值执行
    .collect()

// 防抖：搜索输入框用
queryFlow
    .debounce(300)                 // 300ms 内没新输入才发射
    .flatMapLatest { search(it) }  // 只保留最新一次搜索结果
    .collect { updateList(it) }
```

**线程切换**：`flowOn` 只影响上游（它之前的部分）：

```kt
flow {
    emit(readFromFile()) // 在 IO 线程执行
}.flowOn(Dispatchers.IO) // 上游切到 IO
    .collect { updateUi(it) } // 下游还在主线程
```

**异常处理**：`catch` 只能捕获上游异常，放在 `catch` 之后的代码里的异常捕获不到：

```kt
flow { ... }
    .catch { e -> emit(defaultValue) } // 上游出错给个默认值
    .collect { ... }
```

**StateFlow / SharedFlow**：热流，在架构部分和下面数据层都有用到，配合 `collectAsState` / `collectAsStateWithLifecycle` 直接收集到 Compose。

### 协程与 Compose 结合

**LaunchedEffect**：进入组合自动启动协程，离开组合自动取消（前面副作用部分讲过），适合一次性加载：

```kt
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    LaunchedEffect(Unit) {
        viewModel.load() // 进入页面自动加载
    }
}
```

**rememberCoroutineScope**：在点击回调等非组合场景启动协程：

```kt
@Composable
fun LoginScreen() {
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Button(onClick = {
        scope.launch {
            snackbarHostState.showSnackbar("登录中...")
        }
    }) { Text("登录") }
}
```

**collectAsStateWithLifecycle**：配合生命周期自动暂停/恢复收集，比 `collectAsState` 更省资源：

```kt
// 需要 androidx.lifecycle:lifecycle-runtime-compose
val uiState by viewModel.uiState.collectAsStateWithLifecycle()
```

### 常见坑

1. **别用 GlobalScope**：生命周期不明确，协程容易泄漏
2. **别在 Main 线程做耗时操作**：会卡 UI，必须 `withContext(Dispatchers.IO)` 或 `Dispatchers.Default`
3. **launch 里异常要处理**：协程异常默认会崩 app，用 try/catch 或 `CoroutineExceptionHandler`
4. **`runBlocking` 别乱用**：会阻塞线程，只用在测试或 main 函数
5. **忘记取消**：长任务挂在已销毁的界面上，资源泄漏
6. **Flow 的 catch 位置**：只能捕获它前面的操作符抛出的异常

## 三、数据层

数据层负责和外部世界打交道：网络请求（Retrofit）、本地数据库（Room）、本地存储（DataStore）。它们都基于协程，配合上面的 MVVM 架构使用。

### Retrofit 网络请求封装

Retrofit 是目前最主流的网络请求库，基于 OkHttp，配合协程使用非常简洁。

```kt
// 依赖
implementation(libs.retrofit)
implementation(libs.retrofit.converter.gson)
implementation(libs.okhttp.logging)
```

**定义接口**：`suspend` 函数是官方推荐写法，自动切到后台线程，不用 Call/回调：

```kt
interface ApiService {
    @GET("api/user/{id}")
    suspend fun getUser(@Path("id") id: Int): User

    @POST("api/login")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @GET("api/home/list")
    suspend fun getHomeList(): List<HomeItem>
}
```

**封装 Retrofit 单例**：

```kt
object Network {
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)   // 连接超时
        .readTimeout(10, TimeUnit.SECONDS)      // 读超时
        .addInterceptor { chain ->              // 统一加 token
            val request = chain.request().newBuilder()
                .header("Authorization", "Bearer ${TokenManager.token}")
                .build()
            chain.proceed(request)
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY // 打印请求日志
        })
        .build()

    val api: ApiService = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
}
```

**统一返回包装**：很多后端会把成功和失败包一层，可以写个解包函数，让 UiState 统一走 Error：

```kt
data class ApiResponse<T>(
    val code: Int,
    val message: String,
    val data: T?
)

// 解包：code 不对抛异常
suspend fun <T> ApiResponse<T>.unwrap(): T {
    if (code == 0) return data ?: throw RuntimeException("数据为空")
    throw RuntimeException(message)
}

// 使用
viewModelScope.launch {
    try {
        val user = Network.api.getUser(id).unwrap()
        _uiState.value = Success(user)
    } catch (e: Exception) {
        _uiState.value = Error(e.message ?: "请求失败")
    }
}
```

结合架构使用：ViewModel → Repository → `Network.api`（见 [项目架构](#四项目架构mvvm) 部分的完整示例）。

### Room 数据库

Room 是官方 ORM 数据库（SQLite 的封装），配合 Flow 和协程很好用，不用手写 SQLiteOpenHelper。

```kt
// 依赖（需要 ksp 插件）
implementation(libs.androidx.room.runtime)
ksp(libs.androidx.room.compiler)
implementation(libs.androidx.room.ktx)
```

**实体（表）**：

```kt
@Entity(tableName = "user")
data class UserEntity(
    @PrimaryKey val id: Int,
    val name: String,
    val avatar: String,
    @ColumnInfo(name = "created_at") val createdAt: Long
)
```

**DAO（增删改查）**：

```kt
@Dao
interface UserDao {
    @Query("SELECT * FROM user WHERE id = :id")
    suspend fun getUser(id: Int): UserEntity?

    // 返回 Flow，表数据变化自动发射新值
    @Query("SELECT * FROM user")
    fun observeAll(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity)

    @Update
    suspend fun update(user: UserEntity)

    @Delete
    suspend fun delete(user: UserEntity)

    @Query("DELETE FROM user WHERE id = :id")
    suspend fun deleteById(id: Int)
}
```

**数据库（单例）**：

```kt
@Database(entities = [UserEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun get(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app.db"
                ).build().also { INSTANCE = it }
            }
    }
}
```

**升级数据库**：version 加 1，写 `Migration` 提供旧版本到新版本的 SQL，再 `addMigrations(MIGRATION_1_2)`；不想写迁移可以 `.fallbackToDestructiveMigration()`（会清空数据，只能测试用）。

**在 Repository 里用（缓存优先）**：

```kt
class UserRepositoryImpl(
    private val api: ApiService,
    private val db: AppDatabase
) : UserRepository {
    override suspend fun getUser(id: Int): UserEntity {
        db.userDao().getUser(id)?.let { return it } // 先查缓存
        val user = api.getUser(id)
        db.userDao().insert(user)                    // 写缓存
        return user
    }
}
```

### DataStore 存储

DataStore 用来替代 SharedPreferences 存 key-value，基于 Flow，天然支持协程和类型安全。

```kt
// 依赖
implementation(libs.androidx.datastore.preferences)
```

**创建**（放顶层或单例对象里）：

```kt
val Context.dataStore by preferencesDataStore(name = "settings")
```

**读**：返回 Flow，界面用 `collectAsState` 收集，数据变化自动更新：

```kt
val Context.darkModeFlow: Flow<Boolean> = dataStore.data.map { prefs ->
    prefs[PreferencesKeys.DARK_MODE] ?: false // 读不到给默认值
}

@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    val darkMode by context.darkModeFlow.collectAsState(initial = false)
    // darkMode 变化时自动重组
}
```

**写**：suspend 函数，在协程里调用：

```kt
private object PreferencesKeys {
    val DARK_MODE = booleanPreferencesKey("dark_mode")
}

suspend fun Context.setDarkMode(enabled: Boolean) {
    dataStore.edit { prefs ->
        prefs[PreferencesKeys.DARK_MODE] = enabled
    }
}

// 使用
scope.launch {
    context.setDarkMode(true)
}
```

**配合主题切换**（接上面"主题切换"部分，实现真正的持久化）：

```kt
@Composable
fun App() {
    val context = LocalContext.current
    var darkMode by rememberSaveable { mutableStateOf(false) }

    // 启动时读取持久化的设置
    LaunchedEffect(Unit) {
        context.darkModeFlow.collect { darkMode = it }
    }

    AppTheme(darkTheme = darkMode) {
        // 切换时写入
        Switch(
            checked = darkMode,
            onCheckedChange = {
                darkMode = it
                scope.launch { context.setDarkMode(it) }
            }
        )
    }
}
```

> 还有 Proto DataStore 可以存类型化对象（Protobuf），结构复杂的配置才用；普通 key-value 用 Preferences DataStore 就够了。
> 注意：同一个文件只能有一个 DataStore 实例，不要在多个地方对同名文件调用 `preferencesDataStore`。

## 四、项目架构（MVVM）

MVVM 是现在 Android 官方推荐的主流架构：**View**（Compose 界面）只负责渲染和交互，**ViewModel** 持有界面状态和业务逻辑，**Model**（Repository / 数据源）负责数据获取。

相比以前 Activity 里一把梭，MVVM 的好处：

* 界面和逻辑解耦，Activity 只关心渲染
* 状态放在 ViewModel 中，旋转屏幕不会丢失
* 逻辑不依赖 Android 组件，方便单元测试
* Compose 的响应式特性和 MVVM 天然契合

### 项目包结构

```txt
com.example.app/
├── App.kt                 // Application 入口
├── di/                    // Hilt 依赖注入
│   └── NetworkModule.kt
├── data/                  // 数据层：网络、数据库、本地存储
│   ├── remote/            // Retrofit 接口
│   │   └── ApiService.kt
│   ├── local/             // Room、DataStore
│   └── repository/        // Repository 实现
│       └── UserRepositoryImpl.kt
├── domain/                // 领域层：实体、接口（简单项目可以省略）
│   ├── model/
│   └── repository/        // Repository 接口
├── ui/                    // 界面层
│   ├── theme/             // 主题
│   ├── components/        // 公共组件
│   └── screen/            // 每个页面一个包
│       └── home/
│           ├── HomeScreen.kt        // 界面
│           ├── HomeViewModel.kt     // 状态和逻辑
│           └── HomeUiState.kt       // 界面状态
└── MainActivity.kt
```

小项目不用 domain 层，data + ui 两层就够了，别过度设计。

### ViewModel 生命周期

ViewModel 的生命周期比 Activity/Fragment 长：**旋转屏幕（配置变更）时 Activity 会销毁重建，但 ViewModel 不会**，所以把状态放 ViewModel 里天然防丢。

```kt
class HomeViewModel : ViewModel() {
    val name = MutableStateFlow("")

    override fun onCleared() {
        // Activity 真正销毁时回调，在这里释放资源
        super.onCleared()
    }
}
```

> ViewModel 里**千万不要持有 Activity / Context / View 引用**，会造成内存泄漏。需要上下文时用 `AndroidViewModel(application)` 或 `SavedStateHandle`。

在 Compose 中获取 ViewModel：

```kt
@Composable
fun HomeScreen(viewModel: HomeViewModel = viewModel()) {
    // viewModel() 默认取当前 Activity / NavBackStackEntry 作用域下的实例
}
```

### 带参数的 ViewModel

ViewModel 构造函数默认只能无参（或 `AndroidViewModel`），要传参数用 `viewModelFactory`：

```kt
class DetailViewModel(
    private val id: Int,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    val title = MutableStateFlow("")
}

@Composable
fun DetailScreen(id: Int, viewModel: DetailViewModel = viewModel(factory = viewModelFactory {
    initializer {
        DetailViewModel(id, createSavedStateHandle())
    }
})) {
    // ...
}
```

**SavedStateHandle**：Activity 被系统杀掉再恢复时也能保留的状态容器，页面级参数适合放这里：

```kt
class DetailViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    val id = savedStateHandle.get<Int>("id") ?: 0
    // 写入
    savedStateHandle["id"] = 1
}
```

### 单向数据流（UDF）

MVVM 在 Compose 里的标准写法是单向数据流：

```txt
UI 事件(点击/输入) -> ViewModel 处理 -> 更新 State -> UI 重组
```

* **State（状态）**：界面该显示什么，用 `StateFlow` 暴露
* **Event（事件）**：用户操作，调用 ViewModel 的方法
* UI 永远不直接改状态，只发事件

```kt
@Composable
fun LoginScreen(viewModel: LoginViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    OutlinedTextField(
        value = uiState.username,
        onValueChange = viewModel::onUsernameChange, // 发事件给 ViewModel
        label = { Text("用户名") }
    )

    Button(
        onClick = viewModel::login,
        enabled = !uiState.isLoading
    ) {
        Text(if (uiState.isLoading) "登录中..." else "登录")
    }
}

class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun onUsernameChange(value: String) {
        _uiState.update { it.copy(username = value) }
    }

    fun login() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            // 调用 Repository 请求接口...
            _uiState.update { it.copy(isLoading = false) }
        }
    }
}
```

### UiState 设计

页面状态一般有三种：加载中、成功、失败，可以用 `sealed interface` 表达：

```kt
sealed interface HomeUiState {
    data object Loading : HomeUiState
    data class Success(val list: List<HomeItem>) : HomeUiState
    data class Error(val message: String) : HomeUiState
}
```

```kt
@Composable
fun HomeScreen(viewModel: HomeViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    when (val state = uiState) {
        is HomeUiState.Loading -> CircularProgressIndicator()
        is HomeUiState.Error -> Text("加载失败：${state.message}")
        is HomeUiState.Success -> LazyColumn { /* 渲染列表 */ }
    }
}
```

简单页面也可以用 data class + 标志位，别教条：

```kt
data class LoginUiState(
    val username: String = "",
    val password: String = "",
    val isLoading: Boolean = false
)
```

### Repository 模式

ViewModel 不直接调网络/数据库，而是通过 Repository 拿数据。数据来源可以随时切换（网络、缓存、数据库），ViewModel 不用改：

```kt
// 接口定义在 domain 层
interface UserRepository {
    suspend fun getUser(id: Int): User
}

// 实现放在 data 层
class UserRepositoryImpl(
    private val api: ApiService,
    private val db: UserDao
) : UserRepository {
    override suspend fun getUser(id: Int): User {
        // 先读缓存，再请求网络，失败回退缓存
        val cache = db.getUser(id)
        if (cache != null) return cache

        return try {
            val user = api.getUser(id)
            db.insert(user) // 写缓存
            user
        } catch (e: Exception) {
            cache ?: throw e
        }
    }
}

class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {
    fun loadUser(id: Int) {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Success(repository.getUser(id))
        }
    }
}
```

### 协程与 Flow 在架构中的角色

**viewModelScope**：ViewModel 自带的协程作用域，ViewModel 销毁时自动取消，不用手动管理：

```kt
fun loadData() {
    viewModelScope.launch {
        val data = repository.fetch()
        _uiState.value = ...
    }
}
```

**StateFlow**：状态流，保存"当前值"，适合界面状态。

**SharedFlow**：事件流，适合一次性事件（Toast、跳转）。StateFlow 有粘滞性，重复发射可能被重复消费：

```kt
// 一次性事件（Toast、导航）
private val _toast = MutableSharedFlow<String>()
val toast: SharedFlow<String> = _toast

fun delete() {
    viewModelScope.launch {
        repository.delete()
        _toast.emit("删除成功")
    }
}

// 界面里用 LaunchedEffect 收集
LaunchedEffect(Unit) {
    viewModel.toast.collect { message ->
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
```

**Flow 冷流转热流**：Repository 返回的冷流用 `stateIn` 转成 StateFlow 常驻 ViewModel：

```kt
val uiState = repository.observeData()
    .stateIn(
        scope = viewModelScope,
        started = WhileSubscribed(5000), // 界面消失 5 秒后停止上游
        initialValue = HomeUiState.Loading
    )
```

### 依赖注入（Hilt）

项目大了手动 new 对象很痛苦（ViewModel 依赖 Repository，Repository 依赖 ApiService...），用 Hilt 自动注入：

```kt
// 1. 定义网络模块
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideApiService(): ApiService = Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
}

// 2. Repository 用 @Inject 构造注入
class UserRepositoryImpl @Inject constructor(
    private val api: ApiService
) : UserRepository { ... }

// 3. ViewModel 用 @HiltViewModel + @Inject
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() { ... }

// 4. Compose 里照常用 viewModel()
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) { ... }
```

要点：

* Application 类加 `@HiltAndroidApp`，入口 Activity 加 `@AndroidEntryPoint`
* 接口绑定用 `@Binds` 或 `@Provides` 返回接口类型
* 如果在 NavHost 的页面里，用 `androidx.hilt:hilt-navigation-compose` 提供的 `hiltViewModel()`，否则会拿到 Activity 作用域而不是页面作用域的 ViewModel

### 一个完整的列表页示例

把上面的东西串起来，一个标准的 MVVM 列表页：

**data 层：**

```kt
interface HomeRepository {
    suspend fun getList(): List<String>
}

class HomeRepositoryImpl @Inject constructor(
    private val api: ApiService
) : HomeRepository {
    override suspend fun getList(): List<String> =
        api.getHomeList().map { it.title }
}
```

**ViewModel：**

```kt
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: HomeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState: StateFlow<HomeUiState> = _uiState

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            _uiState.value = try {
                HomeUiState.Success(repository.getList())
            } catch (e: Exception) {
                HomeUiState.Error(e.message ?: "未知错误")
            }
        }
    }
}
```

**界面：**

```kt
@Composable
fun HomeScreen(viewModel: HomeViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    when (val state = uiState) {
        is HomeUiState.Loading -> CircularProgressIndicator(
            modifier = Modifier.fillMaxSize().wrapContentSize()
        )
        is HomeUiState.Error -> Column {
            Text("加载失败：${state.message}")
            TextButton(onClick = viewModel::load) { Text("重试") }
        }
        is HomeUiState.Success -> LazyColumn {
            items(state.list) { item ->
                ListItem(
                    headlineContent = { Text(item) },
                    modifier = Modifier.clickable { /* 点击跳转 */ }
                )
            }
        }
    }
}
```

### 各层如何衔接

* 界面层（Compose）只做渲染和发事件，不写业务逻辑
* ViewModel 持有状态（StateFlow）和处理事件，不碰 Activity / Context
* Repository 统一管理数据来源，ViewModel 不直接调网络
* 用 `viewModelScope` 管理协程，用 `stateIn` / `collectAsState` 连接 Flow 和 Compose
* 项目大了上 Hilt 管理依赖，别手动 new 一堆单例
* 小项目别硬上全部概念，先跑起来，再按需加层

## 五、Android 工程实践

实战中遇到的原生工程问题：播放器封装、多渠道打包、微信跳转。

### ExoPlayer 封装使用

自定义控制界面，可拖动、全屏切换。 倍速暂无
首先安装插件

```kt
 implementation (libs.androidx.media3.exoplayer)
```

#### `VideoViewModel.kt`

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

#### Video Compose 组件

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

#### 自定义控制界面 `CustomPlayerControls.kt`

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

### 安卓多渠道打包

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

### 安卓跳转微信小程序

#### 安装微信 SDK

```kt
 implementation(libs.wechat.sdk.android)//微信SDK
```

#### 微信跳转工具封装

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

#### 注册使用

```kt
//初始化
WeChatUtils.init(it.initConfig?.wxPayAppId ?: "")
//使用 ---跳转微信小程序
WeChatUtils.jumpWxMiniProgram( landingPageInfo?.courseId ?: 0)
```

#### 从小程序返回 App

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

#### 签名配置排查

当前应用包名与小程序后台配置不一致时，微信会提示签名配置错误。包名确认无误后，再检查 `build.gradle.kts` 中 `debug`、`release` 两套 `signingConfig` 是否指向了正确证书。

### App 跳转微信获客链接

```kt
fun jumpWxCustomerLink(customerLink: String) {
    val context = MyAppConfig.getConfig<Context>(MyAppConfig.Keys.APPLICATION)//此次是context ，也可以传进来
    val intent = Intent(Intent.ACTION_VIEW, customerLink.toUri()).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    context.startActivity(intent)
}
```
