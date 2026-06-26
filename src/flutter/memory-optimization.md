---
layout: doc
title: 桌面内存优化
---

# Flutter Windows 桌面应用内存优化实战

> 背景：3A Launcher 是一个基于 Flutter 的 Windows 桌面应用（渲染器启动器），新增在线资源库和下载记录模块后，运行内存从 200MB 飙升到 400-700MB。以下是排查和修复过程。

## 一、ZIP 文件 MD5 计算改为流式（单次节省 50-500MB）

下载完成后需要校验 ZIP 的 MD5，原来把整个文件读进内存：

```dart
// ❌ 一次性加载整个文件到内存（几百MB的ZIP直接撑爆堆）
final zipBytes = await zipFile.readAsBytes();
zipMd5 = md5.convert(zipBytes).toString();
```

改为流式计算，`crypto` 包原生支持：

```dart
// ✅ 流式读取，每次只处理 64KB
zipMd5 = (await md5.bind(zipFile.openRead())).toString();
```

## 二、全局图片缓存限制（节省 100-300MB）

Flutter 默认图片缓存 1000 张 / 100MB，桌面端缩略图场景下很容易打满。在 `main()` 中设置：

```dart
PaintingBinding.instance.imageCache.maximumSizeBytes = 150 * 1024 * 1024; // 150MB
PaintingBinding.instance.imageCache.maximumSize = 200;
```

## 三、缩略图用 Image.network 替代 CachedNetworkImage

在线库/3D 模型的缩略图是翻页浏览场景，`CachedNetworkImage` 的磁盘缓存会无限增长且没必要。改为 `Image.network` + `cacheWidth` 限制解码尺寸：

```dart
// ❌ CachedNetworkImage：磁盘缓存无限增长
CachedNetworkImage(
  imageUrl: url,
  imageBuilder: (_, imageProvider) => Container(...),
)

// ✅ Image.network + cacheWidth：只缓存内存，且限制解码宽度
Image.network(
  url,
  cacheWidth: 300, // 卡片缩略图 300px 足够，不加载原始大图
  fit: BoxFit.cover,
  errorBuilder: (_, __, ___) => Image.asset('assets/images/default.png'),
)
```

详情轮播图用 `cacheWidth: 400`。

## 四、Drift 数据库查询优化（节省 10-50MB）

原来 `getAll()` 加载所有列（含巨大的 `fileTree` JSON），但初始化时只需要 `remoteItemId`、`localDirectory`、`mainFileName`、`fileVersion` 四个字段：

```dart
// ❌ 全量加载所有列
final items = await (database.select(database.downloadedResources)).get();

// ✅ 只查需要的列
static Future<List<({int remoteItemId, String localDirectory, String? mainFileName, int fileVersion})>>
    getAllIdsAndPaths() async {
  final database = DatabaseHelper.database;
  final table = database.downloadedResources;
  final query = database.selectOnly(table)
    ..addColumns([
      table.remoteItemId,
      table.localDirectory,
      table.mainFileName,
      table.fileVersion,
    ]);
  final results = await query.get();
  return results.map((row) => (
    remoteItemId: row.read(table.remoteItemId)!,
    localDirectory: row.read(table.localDirectory)!,
    mainFileName: row.read(table.mainFileName),
    fileVersion: row.read(table.fileVersion)!,
  )).toList();
}
```

## 五、KeepAlive 策略优化

原来所有 8 个 PageView 页面都用 `KeepAlivePage` 包裹，widget 树和 provider 数据全部常驻。改为非核心页面不缓存：

```dart
itemBuilder: (context, index) {
  final widget = _rightMainWidget[index];
  // AI 和学习页不缓存，切走时释放内存
  if (widget is AIDrawPage || widget is Learn) {
    return widget;
  }
  return KeepAlivePage(child: widget);
},
```

同时移除 `Learn` 页面自身的 `AutomaticKeepAliveClientMixin`：

```dart
// ❌ 页面自身也缓存了，即使外层不包 KeepAlivePage 也不会释放
class _LearnState extends ConsumerState<Learn>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
}

// ✅ 去掉 mixin，让页面切走时正常销毁
class _LearnState extends ConsumerState<Learn> { }
```

## 六、3D 模型 coverUrls 优化

`_loadCovers()` 里每个 item 单独触发 `state.copyWith()`，N 个封面 = N 次重建。改为循环结束后一次性更新，切换分类时清空旧数据：

```dart
// ❌ 逐个触发重建
for (final item in newItems) {
  updated[item.id] = url;
  state = state.copyWith(coverUrls: updated); // N 次 rebuild
}

// ✅ 批量更新
var changed = false;
for (final item in newItems) {
  updated[item.id] = url;
  changed = true;
}
if (changed) {
  state = state.copyWith(coverUrls: updated); // 只 1 次 rebuild
}
```

## 七、AI 瀑布流去掉 shrinkWrap（节省 10-30MB）

原来 `MasonryGridView` 设了 `shrinkWrap: true` + `NeverScrollableScrollPhysics`，所有卡片一次性构建。改为 `CustomScrollView` + `SliverMasonryGrid`，懒加载可见项：

```dart
// ❌ shrinkWrap 强制构建所有子项
ListView(
  children: [_buildBanner(), _buildTabs(), _buildGrid()],
)

// ✅ Sliver 懒加载
CustomScrollView(
  slivers: [
    SliverToBoxAdapter(child: _buildBanner()),
    SliverToBoxAdapter(child: _buildTabs()),
    SliverPadding(
      sliver: SliverMasonryGrid.count(
        crossAxisCount: crossAxisCount,
        childCount: items.length,
        itemBuilder: (context, index) => AiGridItem(...),
      ),
    ),
  ],
)
```

## 八、去掉多余的 NavigationView 壳

`fluent_ui` 的 `NavigationView` 自带内部状态管理，但项目中只用到了 `content` 属性包了一层容器，`paneBodyBuilder` 也是空转。直接替换为 `Container`，减少不必要的 widget 开销。

## 优化效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 启动峰值 | ~400MB | ~400MB（数据库读取+文件校验，短暂冲高后回落） |
| 启动基线 | ~400MB | ~150MB |
| 全页面打开 | 400-700MB | <200MB |
| 下载时峰值 | +200-500MB | +极小（流式 MD5） |

## 总结

Flutter 桌面应用内存优化核心思路：

1. **大文件操作必须流式处理**：ZIP、大图片等绝不能 `readAsBytes()` 一次性加载
2. **图片缓存要设上限**：`PaintingBinding.instance.imageCache` 默认值对桌面端太大
3. **数据库查询按需取列**：避免 `SELECT *` 加载 JSON 大字段
4. **KeepAlive 要克制**：非核心页面不要常驻，页面自身的 `AutomaticKeepAliveClientMixin` 也要检查
5. **列表/网格必须懒加载**：`shrinkWrap: true` 是内存杀手，用 Sliver 系列替代

> Release 包实测：所有界面全部打开后稳定在 **200MB 以下**，启动时短暂冲到 400MB（数据库初始化+本地文件校验），随后迅速回落。相比优化前的 400-700MB，内存占用降低 **60%+**。
