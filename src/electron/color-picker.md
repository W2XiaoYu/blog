
# Electron 实现全局屏幕取色器

在 Electron 桌面应用中实现一个类似微信截图工具的全局取色器：点击取色按钮后，出现全屏放大镜浮层，鼠标移动时实时显示像素级放大预览，左键点击取色并复制到剪贴板。

## 最终效果

- 鼠标移动时，圆形放大镜跟随显示 11×11 像素放大网格
- 左键点击取色，自动复制 HEX 到剪贴板
- 右键或 Escape 取消
- Shift 切换 HEX / RGB 格式显示

## 核心依赖

```bash
pnpm add screenshot-desktop
```

> 为什么不用 Electron 自带的 `desktopCapturer`？因为在部分 Windows 环境下 `desktopCapturer.getSources()` 会挂起主进程导致整个应用卡死。`screenshot-desktop` 使用 Windows 原生截图 API，更稳定。

## 整体架构

```
┌─────────────────────────────────────────────┐
│  Renderer (React)                           │
│  ┌─────────┐  window.api.startColorPicker() │
│  │ 吸管按钮 │ ──────────────────────────────►│
│  └─────────┘                                │
├─────────────────────────────────────────────┤
│  Main Process                               │
│  ┌──────────────────────┐                   │
│  │ ColorPickerOverlay   │                   │
│  │ 1. screenshot-desktop│ 截屏              │
│  │ 2. BrowserWindow     │ 全屏显示截图       │
│  │ 3. setInterval 轮询  │ 读光标位置像素     │
│  │ 4. webContents.send  │ 推送放大镜数据     │
│  └──────────────────────┘                   │
├─────────────────────────────────────────────┤
│  Overlay Window (内联 HTML)                  │
│  ┌──────────────────────┐                   │
│  │ <img> 显示截图        │                   │
│  │ <canvas> 放大镜       │  跟随鼠标渲染      │
│  │ 颜色信息面板          │  HEX/RGB + 色块    │
│  └──────────────────────┘                   │
└─────────────────────────────────────────────┘
```

## 第一步：ColorPickerOverlay 主类

创建 `src/main/color-picker-overlay.ts`：

```ts
import { BrowserWindow, clipboard, nativeImage, screen, app } from 'electron'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import screenshot from 'screenshot-desktop'

const GRID = 11     // 放大镜采样像素数（奇数）
const ZOOM = 8      // 每个像素放大倍数
const CANVAS = GRID * ZOOM  // canvas 尺寸 = 88px
const THROTTLE_MS = 32      // 轮询间隔

export class ColorPickerOverlay {
  private overlay: BrowserWindow | null = null
  private mainWindow: BrowserWindow | null = null
  private cachedBitmap: Buffer | null = null
  private imgWidth = 0
  private imgHeight = 0
  private scaleFactorX = 1
  private scaleFactorY = 1
  private cssWidth = 0
  private cssHeight = 0
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private lastColor: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 }
  private _active = false
  private tempHtmlPath: string | null = null
  private tempImgPath: string | null = null

  // 回调事件
  onColorPicked: ((color: { r: number; g: number; b: number }) => void) | null = null
  onCancelled: (() => void) | null = null

  constructor(mainWindow: BrowserWindow | null) {
    this.mainWindow = mainWindow
  }

  get active() { return this._active }
}
```

### 关键点：为什么用不透明全屏窗口？

踩过的坑：

| 方案 | 问题 |
|------|------|
| 全屏透明窗口 + `setIgnoreMouseEvents` | Windows 上 `close()` 导致 Chromium 死锁 ([Electron #24218](https://github.com/electron/electron/issues/24218)) |
| `desktopCapturer.getSources()` | 部分Windows环境挂起主进程 |
| data: URL 加载 HTML | `require('electron')` 不可用 |

**最终方案**：用 `screenshot-desktop` 截屏 → 保存临时 PNG → 全屏不透明窗口显示截图 → 用户看到的就是屏幕内容，窗口能正常接收鼠标事件。

## 第二步：截屏与窗口创建

```ts
async start(): Promise<void> {
  const display = screen.getPrimaryDisplay()
  this.cssWidth = display.size.width
  this.cssHeight = display.size.height

  // 1. 截屏（screenshot-desktop 使用 Windows 原生 API）
  const pngBuffer = await screenshot({ format: 'png' })
  const img = nativeImage.createFromBuffer(pngBuffer)
  const size = img.getSize()
  this.imgWidth = size.width
  this.imgHeight = size.height

  // 动态计算缩放比（screenshot-desktop 截图分辨率可能与 CSS 像素不同）
  this.scaleFactorX = this.imgWidth / this.cssWidth
  this.scaleFactorY = this.imgHeight / this.cssHeight
  this.cachedBitmap = img.toBitmap()

  // 2. 保存截图到临时文件
  const ts = Date.now()
  this.tempImgPath = join(app.getPath('temp'), `cp-screen-${ts}.png`)
  writeFileSync(this.tempImgPath, pngBuffer)

  // 3. 创建全屏窗口（不透明！）
  const { x: dx, y: dy } = display.bounds
  this.overlay = new BrowserWindow({
    width: this.cssWidth,
    height: this.cssHeight,
    x: dx, y: dy,
    show: false,
    frame: false,
    transparent: false,  // 关键：不透明！
    resizable: false,
    closable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  })
  this.overlay.setAlwaysOnTop(true, 'screen-saver')

  // 4. 写入 HTML 并加载
  this.tempHtmlPath = join(app.getPath('temp'), `cp-overlay-${ts}.html`)
  writeFileSync(
    this.tempHtmlPath,
    overlayHTML(CANVAS, GRID, ZOOM, this.tempImgPath, this.cssWidth, this.cssHeight),
    'utf-8',
  )
  this.overlay.loadFile(this.tempHtmlPath)

  this.overlay.once('ready-to-show', () => {
    this.overlay?.show()
    this.overlay?.focus()
    this._active = true
    this.startPolling()
  })
}
```

## 第三步：像素读取与轮询

### 轮询光标位置并读取像素颜色

```ts
private startPolling() {
  let lastTime = 0
  this.pollTimer = setInterval(() => {
    const now = Date.now()
    if (now - lastTime < THROTTLE_MS) return
    lastTime = now
    this.sampleAndSend()
  }, THROTTLE_MS)
}

private sampleAndSend() {
  if (!this.cachedBitmap || !this.overlay || this.overlay.isDestroyed()) return

  const pos = screen.getCursorScreenPoint()
  const px = Math.round(pos.x * this.scaleFactorX)
  const py = Math.round(pos.y * this.scaleFactorY)

  const color = this.readPixel(px, py)
  if (!color) return
  this.lastColor = color

  // 转为窗口内 CSS 坐标
  const { x: dx, y: dy } = screen.getPrimaryDisplay().bounds
  const cssX = pos.x - dx
  const cssY = pos.y - dy

  const pixels = this.readMagnifierPixels(px, py)

  // 推送到 overlay 窗口更新放大镜
  this.overlay.webContents.send('mag-update', { cssX, cssY, color, pixels })
}
```

### 读取单个像素

> Windows 上 `screenshot-desktop` → PNG → `nativeImage.toBitmap()` 输出的是 **BGRA** 格式，R 和 B 通道需要交换！

```ts
private readPixel(x: number, y: number): { r: number; g: number; b: number } | null {
  if (!this.cachedBitmap) return null
  if (x < 0 || x >= this.imgWidth || y < 0 || y >= this.imgHeight) return null

  const idx = (y * this.imgWidth + x) * 4
  // Windows: BGRA 格式！
  return {
    b: this.cachedBitmap[idx],       // B
    g: this.cachedBitmap[idx + 1],   // G
    r: this.cachedBitmap[idx + 2],   // R
  }
}
```

### 读取放大镜网格（11×11 像素）

```ts
private readMagnifierPixels(cx: number, cy: number): string[] {
  const pixels: string[] = []
  const half = Math.floor(GRID / 2)
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const c = this.readPixel(cx + dx, cy + dy)
      pixels.push(c ? `rgb(${c.r},${c.g},${c.b})` : 'rgb(0,0,0)')
    }
  }
  return pixels
}
```

## 第四步：取色 / 取消 / 清理

```ts
handlePick() {
  if (!this._active) return
  this._active = false
  const color = { ...this.lastColor }

  // 复制到剪贴板
  const hex = '#' + [color.r, color.g, color.b]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  clipboard.writeText(hex)

  this.onColorPicked?.(color)
  this.cleanup()
}

handleCancel() {
  if (!this._active) return
  this._active = false
  this.onCancelled?.()
  this.cleanup()
}
```

### 清理：焦点恢复 + destroy + 删临时文件

```ts
private cleanup() {
  this.stopPolling()

  // 先把主窗口拉到前台，再销毁 overlay
  // 否则焦点会跑到桌面或其他应用
  if (this.mainWindow && !this.mainWindow.isDestroyed()) {
    this.mainWindow.moveTop()
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  // 用 destroy() 而不是 close()
  // close() 在 Windows 上对无边框窗口可能死锁
  if (this.overlay && !this.overlay.isDestroyed()) {
    this.overlay.destroy()
  }
  this.overlay = null
  this.cachedBitmap = null

  // 清理临时文件
  for (const p of [this.tempHtmlPath, this.tempImgPath]) {
    if (p) {
      try { unlinkSync(p) } catch { /* ignore */ }
    }
  }
  this.tempHtmlPath = null
  this.tempImgPath = null
}
```

## 第五步：Overlay 窗口的 HTML（放大镜 + 信息面板）

放大镜使用 Canvas 渲染，关键要素：
- 圆形裁剪（`arc` + `clip`）
- 像素网格 + 细分隔线
- 十字准星（四条短线，不遮挡中心像素）
- 颜色信息面板（色块 + HEX/RGB 值 + Shift 提示）

```ts
function overlayHTML(canvas: number, grid: number, zoom: number,
                     imgPath: string, cssW: number, cssH: number) {
  const imgSrc = 'file:///' + imgPath.replace(/\\/g, '/')
  const magDiam = canvas

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; }
  html, body {
    width: ${cssW}px; height: ${cssH}px;
    overflow: hidden; cursor: crosshair; user-select: none;
    background: #000;
  }
  #bg { position: absolute; top: 0; left: 0;
        width: ${cssW}px; height: ${cssH}px; }

  /* 圆形放大镜 */
  #mag {
    position: absolute; pointer-events: none;
    width: ${magDiam}px; height: ${magDiam}px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.7);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  #mag canvas { display: block; }

  /* 颜色信息面板 */
  #info {
    position: absolute; pointer-events: none;
    display: flex; align-items: center; gap: 6px;
    background: rgba(30,30,30,0.92);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px; padding: 4px 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  #swatch {
    width: 22px; height: 22px; border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.25); flex-shrink: 0;
  }
  #hex { font: 600 12px/1.2 monospace; color: #fff; }
  #hint { font: 10px/1.2 monospace; color: rgba(255,255,255,0.4); }
</style>
</head>
<body>
  <img id="bg" src="${imgSrc}" />
  <div id="mag"><canvas id="cvs" width="${canvas}" height="${canvas}"></canvas></div>
  <div id="info">
    <div id="swatch"></div>
    <div><span id="hex">#000000</span><br/><span id="hint">Shift: HEX → RGB</span></div>
  </div>
<script>
// ... 放大镜渲染、Shift切换、鼠标事件等 JS 代码
// 完整代码见下方
</script>
</body>
</html>`
}
```

### 放大镜渲染核心逻辑

```js
// 接收主进程推送的放大镜数据
require('electron').ipcRenderer.on('mag-update', (_, { cssX, cssY, color, pixels }) => {
  curColor = color;

  // 圆形裁剪渲染像素网格
  ctx.clearRect(0, 0, canvas, canvas);
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas / 2, canvas / 2, canvas / 2, 0, Math.PI * 2);
  ctx.clip();

  for (let dy = 0; dy < grid; dy++) {
    for (let dx = 0; dx < grid; dx++) {
      ctx.fillStyle = pixels[dy * grid + dx] || '#000';
      ctx.fillRect(dx * zoom, dy * zoom, zoom, zoom);
    }
  }

  // 细网格线
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= grid; i++) {
    ctx.beginPath();
    ctx.moveTo(i * zoom, 0); ctx.lineTo(i * zoom, canvas);
    ctx.moveTo(0, i * zoom); ctx.lineTo(canvas, i * zoom);
    ctx.stroke();
  }
  ctx.restore();

  // 十字准星（在 clip 外绘制）
  const cx = half * zoom + zoom / 2;
  const cy = half * zoom + zoom / 2;
  const armLen = zoom * 1.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1;
  // 四条短线，中间留空不遮挡中心像素
  ctx.beginPath(); ctx.moveTo(cx, cy - zoom * 0.3); ctx.lineTo(cx, cy - armLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + zoom * 0.3); ctx.lineTo(cx, cy + armLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - zoom * 0.3, cy); ctx.lineTo(cx - armLen, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + zoom * 0.3, cy); ctx.lineTo(cx + armLen, cy); ctx.stroke();

  // 中心像素高亮
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(half * zoom, half * zoom, zoom, zoom);

  // 更新颜色文本
  updateLabel();
});
```

### 交互事件处理

```js
// Shift 切换 HEX/RGB 格式
document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') { e.preventDefault(); showRgb = !showRgb; updateLabel(); }
  if (e.key === 'Escape') require('electron').ipcRenderer.send('cp-overlay-cancel');
});

// 左键取色，右键取消
document.addEventListener('mousedown', (e) => {
  if (e.button === 0) require('electron').ipcRenderer.send('cp-overlay-click', { text: formatColor(curColor) });
  if (e.button === 2) require('electron').ipcRenderer.send('cp-overlay-cancel');
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
```

## 第六步：主进程 IPC 注册

在 `src/main/index.ts` 中：

```ts
import { ColorPickerOverlay } from './color-picker-overlay'

let colorPickerOverlay: ColorPickerOverlay | null = null

function createMainWindow() {
  // ... 创建主窗口后 ...

  colorPickerOverlay = new ColorPickerOverlay(mainWindow)
  colorPickerOverlay.onColorPicked = (color) => {
    mainWindow?.webContents.send('color-picker:color-picked', { color })
  }
  colorPickerOverlay.onCancelled = () => {
    mainWindow?.webContents.send('color-picker:exit')
  }
}

// IPC 注册
ipcMain.handle('color-picker:start', async () => {
  if (!colorPickerOverlay) return { success: false, error: 'Not initialized' }
  try {
    await colorPickerOverlay.start()
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

// overlay 窗口内部 IPC
ipcMain.on('cp-overlay-click', (_event, data?: { text?: string }) => {
  if (data?.text) clipboard.writeText(data.text)
  colorPickerOverlay?.handlePick()
})
ipcMain.on('cp-overlay-cancel', () => colorPickerOverlay?.handleCancel())
```

## 第七步：Renderer 端调用

### Preload 暴露 API

```ts
// src/preload/index.ts
startColorPicker: () => ipcRenderer.invoke('color-picker:start'),
onColorPickerPicked: (callback) => {
  const handler = (_event, data) => callback(data)
  ipcRenderer.on('color-picker:color-picked', handler)
  return () => ipcRenderer.removeListener('color-picker:color-picked', handler)
},
onColorPickerExit: (callback) => {
  const handler = () => callback()
  ipcRenderer.on('color-picker:exit', handler)
  return () => ipcRenderer.removeListener('color-picker:exit', handler)
},
```

### React 组件调用

```tsx
const [isPickMode, setIsPickMode] = useState(false)

const handleStartPick = async () => {
  setIsPickMode(true)
  const result = await window.api.startColorPicker()
  if (!result.success) setIsPickMode(false)
}

useEffect(() => {
  if (!isPickMode) return

  const unsubPicked = window.api.onColorPickerPicked((data) => {
    // data.color = { r, g, b }
    updateColor(data.color)
    setIsPickMode(false)
  })
  const unsubExit = window.api.onColorPickerExit(() => {
    setIsPickMode(false)
  })

  return () => { unsubPicked(); unsubExit() }
}, [isPickMode])
```

## 踩坑总结

### 1. Windows 透明窗口 close() 死锁

**现象**：全屏透明无边框窗口调用 `close()` 后整个应用卡死。

**原因**：Windows DWM 和 Chromium 的交互 bug。

**解决**：用不透明窗口 + 显示截图代替透明窗口；关闭时用 `destroy()` 而非 `close()`。

### 2. desktopCapturer 挂起主进程

**现象**：`desktopCapturer.getSources()` 调用后 Promise 永远不 resolve。

**解决**：用 `screenshot-desktop` 库代替，它使用 Windows 原生 GDI/DXGI API。

### 3. BGRA vs RGBA 颜色反转

**现象**：取到的颜色红色和蓝色反了。

**原因**：Windows 上 `screenshot-desktop` → PNG → `nativeImage.toBitmap()` 输出 BGRA。

**解决**：读取像素时交换 B 和 R 通道：

```ts
return {
  b: bitmap[idx],       // 索引 0 = B
  g: bitmap[idx + 1],   // 索引 1 = G
  r: bitmap[idx + 2],   // 索引 2 = R
}
```

### 4. DPI 缩放坐标偏移

**现象**：高 DPI 屏幕上取色位置不准确。

**原因**：CSS 像素和物理像素不一致。

**解决**：根据实际截图尺寸动态计算缩放比：

```ts
this.scaleFactorX = this.imgWidth / this.cssWidth
this.scaleFactorY = this.imgHeight / this.cssHeight
```

### 5. 取色后焦点丢失

**现象**：取色完成后应用窗口跑到桌面后面。

**解决**：在销毁 overlay 之前先把主窗口拉到前台：

```ts
this.mainWindow.moveTop()
this.mainWindow.show()
this.mainWindow.focus()
```
