---
layout: doc
title: Electron
---

# Electron

Electron 把 Web 带到了桌面，也把窗口、系统 API 和打包发布的问题一并带了过来。这里记录几个已经在项目里走通的实现。

- [Windows 软件更新方案](./electron/windows-update) — 参考 JetBrains 与 VS Code，差量补丁与目录切换的取舍与组件清单
- [打包自动代码签名](./electron/code-signing) — Electron 打包时自动完成 Windows 代码签名
- [透明窗口 slider 拖拽光标](./electron/slider-drag-cursor) — 在透明分层窗口里，让拖拽光标始终保持 `ew-resize`
