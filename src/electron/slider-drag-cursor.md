# Electron 透明窗口中 slider 拖拽光标失效的解决方案

在一个 **transparent 分层窗口**的 Electron 应用里，左右拖动 slider（如调整音量/进度）时，希望鼠标全程显示 `ew-resize`（↔）光标。但实际表现是：拖拽开始后，光标一旦移出 slider 本身的范围就会变回默认箭头，甚至直接穿透到桌面/其他应用，体验很差。

本文记录一种**纯命令式、不依赖任何 CSS 类**的解决方案。

## 问题复现

环境前提：主进程创建窗口时使用了透明分层窗口：

```ts
// main 进程
const win = new BrowserWindow({
  // ...
  transparent: true,
  frame: false,
})
```

渲染进程里 slider 拖拽期间，常规做法是给 `body` 加个 `cursor: ew-resize` 的 CSS 类：

```ts
// ❌ 常规做法：拖拽时加全局 class
useEffect(() => {
  if (!active) return
  document.body.classList.add('dragging-ew')
  return () => document.body.classList.remove('dragging-ew')
}, [active])
```

```css
/* ❌ 不生效 */
.dragging-ew,
.dragging-ew * {
  cursor: ew-resize !important;
}
```

**结果**：光标在 slider 元素内是对的，一旦移出 slider（比如滑到窗口空白区域），光标立刻失效，变回默认箭头或穿透。

## 根因分析

有两层原因叠加：

### 1. CSS cursor 在跨元素移动时会重新计算

`cursor` 是跟随**鼠标当前命中的元素**的。拖拽时鼠标快速移动，一旦离开了 slider 元素，命中的是别的元素（或透明区域），就会用那个元素的 cursor，所以 slider 上设的 `ew-resize` 跟不过去。

### 2. transparent 窗口的透明像素会让鼠标穿透

这是 Electron 透明窗口的特性：**完全透明（alpha=0）的像素，鼠标事件会穿透窗口**，落到后面的桌面或其他应用上。窗口空白区域大多是 alpha=0，所以鼠标一移过去就"漏"出去了，`setIgnoreMouseEvents` 默认行为下，cursor 自然也显示不出来。

> 给覆盖层加一个不透明 `background` 能挡住穿透，但创建/移除覆盖层的瞬间会**全屏闪烁**一次，不可接受。

## 解决方案

核心思路两步：

1. **插入全屏覆盖层**：拖拽时在 `body` 末尾插一个 `fixed; inset:0` 的覆盖层，inline 设 `cursor: ew-resize`。鼠标无论移到哪都命中它 → 稳定显示 `ew-resize`。
2. **临时关闭窗口鼠标穿透**：因为覆盖层是透明的（不想闪烁），必须靠关闭窗口穿透来让透明覆盖层也能接收鼠标。拖拽期间调用 `setIgnoreMouseEvents(false)`，结束后恢复。

完整 hook：

```ts
import { useEffect } from 'react'

/**
 * slider 拖拽期间强制全局 ew-resize 光标（纯命令式，不依赖任何 CSS 类）。
 *
 * 原理：拖拽时在 body 末尾插入一个 fixed 全屏覆盖层，inline cursor: ew-resize，
 * 鼠标无论移到哪都命中它 → 显示 ew-resize。
 *
 * 为什么要 setIgnoreMouseEvents(false)：本项目窗口是 transparent 分层窗口，
 * 完全透明（alpha=0）的像素会让鼠标穿透到桌面/其他应用，覆盖层 cursor 失效。给覆盖层
 * 加 background 虽能挡穿透，但创建/移除瞬间会全屏闪烁。改为拖拽期间临时关闭窗口
 * 鼠标穿透，完全透明的覆盖层即可稳定显示光标，且零视觉闪烁。
 * 结束后恢复为不穿透；鼠标移回视口时 CenterPanel 会重新开启 forward 穿透。
 *
 * @param active 是否处于拖拽中
 */
export const useSliderDragCursor = (active: boolean) => {
  useEffect(() => {
    if (!active) return
    window.api.setIgnoreMouseEvents(false)
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;inset:0;z-index:99999;cursor:ew-resize;'
    document.body.appendChild(el)
    return () => {
      el.remove()
      window.api.setIgnoreMouseEvents(false)
    }
  }, [active])
}

export default useSliderDragCursor
```

## 关键点说明

### 为什么用覆盖层而不是 CSS 类

覆盖层 `position:fixed; inset:0` 铺满整个视口，且 `z-index:99999` 保证它在最上层。鼠标在拖拽期间命中的永远是这个覆盖层，所以 `cursor` 永远是 `ew-resize`，不会因为跨元素而丢失。

### 为什么 cleanup 里也是 `setIgnoreMouseEvents(false)`

这与窗口的**穿透策略**有关。本项目用 `setIgnoreMouseEvents(true, { forward: true })` 让窗口大部分区域鼠标穿透（透明壁纸类应用的常见做法），只在需要交互的区域临时关掉穿透。

拖拽结束后，这里**没有**重新开启 `forward` 穿透，而是保持 `false`（不穿透）。原因是：刚结束拖拽时鼠标很可能还在视口外或边缘，如果立刻恢复穿透，鼠标位置可能正好落在透明像素上又穿透出去，导致紧随其后的 click 失效。保持不穿透，等鼠标重新移回交互区域（`CenterPanel`），再由那里的 `mouseenter` 重新开启 `forward`。

> 即：**穿透的开关交给具体交互区域的 mouseenter/mouseleave 管理**，拖拽 hook 只负责拖拽期间的状态，不越权恢复穿透。

### 关于闪烁

覆盖层完全透明（没有 background），所以创建和移除都不会引起任何视觉变化。零闪烁。

## 总结

| 现象 | 原因 | 对应手段 |
|------|------|---------|
| 光标移出 slider 就变回箭头 | cursor 跟随命中元素 | 全屏覆盖层强制 `ew-resize` |
| 光标在透明区域失效/穿透 | transparent 窗口 alpha=0 像素穿透 | 拖拽期间 `setIgnoreMouseEvents(false)` |
| 给覆盖层加背景会闪烁 | 覆盖层创建/移除瞬间全屏变色 | 覆盖层保持透明，靠关穿透而非挡背景 |

这套方案的本质是：**用 DOM 覆盖层解决"光标跟随"问题，用窗口 API 解决"透明穿透"问题，两者配合**。适用于所有 transparent 分层窗口里需要强制全局光标的场景，不只是 slider。
