# View Transitions API 实现圆形扩散主题切换（仿 B 站客户端效果）

Electron 桌面客户端、VitePress 博客、Wails 桌面应用——只要底层是 Chromium（WebView2 / Chromium 内核），都可以用 **View Transitions API** 实现类似哔哩哔哩客户端那种「点击按钮，圆形扩散切换主题」的丝滑动画效果。

本文从原理到落地，详细讲解如何实现 **双向动画**：切到暗色时圆形扩散铺开，切回亮色时圆形收回缩小，无闪烁。

## 效果预览

- **Light → Dark（扩散）**：从点击位置开始，深色主题像水波一样向外圆形扩散，覆盖整个窗口
- **Dark → Light（收回）**：从点击位置开始，深色主题向内圆形收缩消失，露出底下的亮色主题

## 核心原理：View Transitions API

### 什么是 View Transitions API

`document.startViewTransition(callback)` 是 Chromium 提供的原生 API，工作流程：

1. 调用 `startViewTransition()`，浏览器对当前页面**截图**（生成 `::view-transition-old(root)` 伪元素）
2. 执行 `callback`（在这里切换 DOM / 状态）
3. 浏览器对更新后的页面再**截图**（生成 `::view-transition-new(root)` 伪元素）
4. 默认播放一个交叉淡入淡出动画

我们要做的，就是**关掉默认的淡入淡出，换成自定义的 `clip-path: circle()` 圆形动画**。

### 为什么用 CSS @keyframes 而不是 JS animate()

::: danger 踩坑经验
最初用 `document.documentElement.animate()` 对伪元素做动画，结果 **dark → light 的收回动画完全不播放**，一瞬间就没了。
:::

原因是 JS `element.animate()` 对 `::view-transition-old(root)` 伪元素的支持在某些 Chromium 版本上不可靠。**改用纯 CSS `@keyframes` + `animation` 属性后完美解决**。

## 完整实现

### 第一步：JS 逻辑

```vue
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
    if (!enableTransitions()) {
        isDark.value = !isDark.value
        return
    }

    // 记录切换前的状态（切换后 isDark 会变，所以提前取）
    const willBeDark = !isDark.value
    const root = document.documentElement

    // 设置点击坐标 CSS 变量 + 方向 class，动画由 CSS @keyframes 驱动
    root.classList.remove('theme-grow', 'theme-shrink')
    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    // 强制重排，确保 class 生效后再启动 transition
    void root.offsetWidth
    root.classList.add(willBeDark ? 'theme-grow' : 'theme-shrink')

    const transition = document.startViewTransition(async () => {
        isDark.value = !isDark.value
        await nextTick()
    })

    // 动画完成后清理 class
    transition.finished.then(() => {
        root.classList.remove('theme-grow', 'theme-shrink')
    })
})
</script>
```

**关键点解析：**

| 代码 | 作用 |
|------|------|
| `willBeDark = !isDark.value` | **在切换前**记录目标方向，因为 `switchTheme` 回调执行后 `isDark` 就变了 |
| `--theme-x` / `--theme-y` | 把鼠标点击坐标传给 CSS，圆形动画从点击位置开始 |
| `void root.offsetWidth` | 强制浏览器重排，确保 class 切换立即生效（否则可能被合并到同一帧） |
| `theme-grow` / `theme-shrink` | 方向标记，CSS 根据它决定哪个伪元素在上层、用哪个动画 |
| `transition.finished.then()` | 动画真正完成后才清理 class（不是 `transition.ready`！） |

### 第二步：CSS 动画

```css
/* ===== 关掉默认的交叉淡入淡出 ===== */
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    overflow: hidden;
}

/* ===== 扩散模式（切到 dark）===== */
/* 新主题在上面，从点击点圆形扩散 */
.theme-grow::view-transition-old(root) { z-index: 1; }
.theme-grow::view-transition-new(root) {
    z-index: 9999;
    animation: theme-grow 400ms ease-in-out forwards;
}

/* ===== 收回模式（切到 light）===== */
/* 旧主题在上面，从全屏收缩回点击点 */
.theme-shrink::view-transition-old(root) {
    z-index: 9999;
    animation: theme-shrink 400ms ease-in-out forwards;
}
.theme-shrink::view-transition-new(root) { z-index: 1; }

/* ===== 关键帧 ===== */
@keyframes theme-grow {
    from { clip-path: circle(0px at var(--theme-x) var(--theme-y)); }
    to   { clip-path: circle(150% at var(--theme-x) var(--theme-y)); }
}

@keyframes theme-shrink {
    from { clip-path: circle(150% at var(--theme-x) var(--theme-y)); }
    to   { clip-path: circle(0px at var(--theme-x) var(--theme-y)); }
}
```

## 为什么要分两种模式

这是实现双向动画的核心。View Transition 会生成两个伪元素：

```
::view-transition-old(root)  ← 旧主题截图
::view-transition-new(root)  ← 新主题截图
```

**谁在上面（z-index 大），就对谁做 clip-path 动画：**

### 扩散（Light → Dark）

```
下层：::view-transition-old（亮色旧主题，完整显示）
上层：::view-transition-new（暗色新主题，从点击点 circle(0) 扩大到 circle(150%)）
```

视觉效果：暗色从点击点向外扩散，逐渐覆盖亮色。

### 收回（Dark → Light）

```
下层：::view-transition-new（亮色新主题，完整显示）
上层：::view-transition-old（暗色旧主题，从 circle(150%) 收缩到 circle(0)）
```

视觉效果：暗色向点击点收缩消失，逐渐露出底下的亮色。

## 常见坑

### 坑 1：用 JS `clipPath.reverse()` 导致方向错乱

```ts
// ❌ 错误写法（VitePress 官方文档的示例就有这个问题）
const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${maxR}px at ${x}px ${y}px)`
]
document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    // ...
)
```

`Array.reverse()` 会**原地修改数组**，多次切换后 clipPath 数组被反复 reverse，方向会错乱。而且用 `isDark.value` 判断方向时，它已经被 toggle 了，读到的是新值，判断反了。

### 坑 2：收回动画不播放

用 JS `document.documentElement.animate()` 对 `::view-transition-old(root)` 做动画，在某些环境下不生效。改用 CSS `@keyframes` + `animation` 属性后完美解决。

### 坑 3：收回完成时闪烁

收回动画结束后，如果不加 `animation-fill-mode: forwards`，`::view-transition-old(root)` 的 `clip-path` 会瞬间回到初始值（无 clip = 完全可见），闪一下旧主题。

```css
/* ❌ 不加 forwards，收回结束瞬间闪烁 */
animation: theme-shrink 400ms ease-in-out;

/* ✅ 加 forwards，保持 circle(0px) 完全隐藏状态 */
animation: theme-shrink 400ms ease-in-out forwards;
```

### 坑 4：class 清理时机不对

```ts
// ❌ 用 transition.ready，动画刚启动就清理了
transition.ready.then(() => {
    root.classList.remove('theme-grow', 'theme-shrink')
})

// ✅ 用 transition.finished，动画真正完成后才清理
transition.finished.then(() => {
    root.classList.remove('theme-grow', 'theme-shrink')
})
```

`transition.ready` 在动画**刚准备播放**时就 resolve 了，此时清理 class 会导致 z-index 恢复默认，动画瞬间消失。

## 为什么用 `circle(150%)` 而不是精确计算 maxR

```css
/* 简洁写法，150% 相对于视口参考框 */
clip-path: circle(150% at var(--theme-x) var(--theme-y));
```

`circle()` 的百分比值是相对于元素的**引用框**（reference box）计算的，对于 `::view-transition` 伪元素就是整个视口。`150%` 足以覆盖从任意位置到最远角的距离，比 JS 里 `Math.hypot()` 计算更简洁可靠。

## 在不同框架中的应用

### VitePress

VitePress 自带 `toggle-appearance` 的 provide 机制，直接在 `Layout` 组件里 override 即可（见上方代码）。

### React / 通用 Web

```tsx
const toggleTheme = (e: React.MouseEvent) => {
    const x = e.clientX
    const y = e.clientY
    const willBeDark = !isDark
    const root = document.documentElement

    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    void root.offsetWidth
    root.classList.add(willBeDark ? 'theme-grow' : 'theme-shrink')

    const transition = document.startViewTransition(() => {
        setIsDark(willBeDark)  // 你的状态切换
    })

    transition.finished.then(() => {
        root.classList.remove('theme-grow', 'theme-shrink')
    })
}
```

CSS 部分完全相同，直接复制即可。

### Electron / Wails

WebView2 基于 Chromium，完全支持 View Transitions API。用法和通用 Web 一样，无需额外配置。

## 浏览器兼容性

| 浏览器 | 支持版本 |
|--------|---------|
| Chrome / Edge | 111+ |
| WebView2 | 111+ |
| Safari | 18+ |
| Firefox | 不支持 |

对于不支持的环境，代码里已经做了降级处理（检测 `startViewTransition` 是否存在，不存在则直接切换主题，无动画）。

```ts
if (!('startViewTransition' in document)) {
    isDark.value = !isDark.value  // 直接切换，无动画
    return
}
```

## 总结

| 要点 | 方案 |
|------|------|
| 动画引擎 | 纯 CSS `@keyframes`，不用 JS `animate()` |
| 方向控制 | `theme-grow`（扩散）/ `theme-shrink`（收回）两个 class |
| z-index | 扩散时 new 在上层，收回时 old 在上层 |
| 点击位置 | `--theme-x` / `--theme-y` CSS 变量 |
| 防闪烁 | `animation-fill-mode: forwards` |
| 清理时机 | `transition.finished` 而非 `transition.ready` |
| 降级 | 检测 `startViewTransition`，不支持则直接切换 |
