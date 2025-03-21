
# jetpack compose 学习

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