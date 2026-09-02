import type { DefaultTheme } from 'vitepress'

const frontItems = [
  { text: 'Vue', link: '/front/vue' },
  { text: 'React', link: '/front/react' },
  { text: 'View Transitions 主题切换', link: '/front/view-transition-theme' },
  { text: 'TypeScript Utility Types', link: '/front/typescript-utility-types' },
  { text: '代码片段', link: '/front/code-snippets' },
]

const flutterItems = [
  { text: '打包构建', link: '/flutter/packaging' },
  { text: '安卓原生', link: '/flutter/android-native' },
  { text: 'Windows 桌面', link: '/flutter/windows-desktop' },
  { text: '桌面内存优化', link: '/flutter/memory-optimization' },
  { text: '自定义拖拽与拖拽加密', link: '/flutter/custom-drag-encryption' },
  { text: '代码片段', link: '/flutter/code-snippets' },
]

const cocosItems = [
  { text: 'Cocos 介绍', link: '/cocos' },
  { text: '3.8.x 2D 基础', link: '/cocos/basic-2d' },
]

const cocosNavItems = [
  { text: 'Cocos', link: '/cocos' },
  { text: '3.8.x 2D 基础', link: '/cocos/basic-2d' },
]

const electronItems = [
  { text: '打包自动代码签名', link: '/electron/code-signing' },
  { text: '透明窗口 slider 拖拽光标', link: '/electron/slider-drag-cursor' },
]

const databaseDesignItems = [
  { text: '多账号登录与账号合并', link: '/back-end/database-design/multi-account-auth-merge' },
  { text: '一级邀请分佣', link: '/back-end/database-design/direct-invite-commission' },
  { text: '商品 SPU 与 SKU', link: '/back-end/database-design/product-spu-sku' },
]

const backendNavItems = [
  { text: 'Go 语言', link: '/back-end/go' },
  { text: 'Gin', link: '/back-end/gin' },
  { text: 'GORM', link: '/back-end/gorm' },
  { text: '数据库设计', link: '/back-end/database-design' },
  { text: 'Docker 部署', link: '/back-end/docker-deploy' },
  { text: 'Nginx', link: '/back-end/nginx' },
  { text: 'Linux 命令', link: '/back-end/command' },
  { text: 'vim 编辑器', link: '/back-end/vim' },
]

const backendSidebarItems = [
  { text: 'Go 语言', link: '/back-end/go' },
  { text: 'Gin', link: '/back-end/gin' },
  { text: 'GORM', link: '/back-end/gorm' },
  {
    text: '数据库设计',
    link: '/back-end/database-design',
    collapsed: false,
    items: databaseDesignItems,
  },
  { text: 'Docker 部署', link: '/back-end/docker-deploy' },
  { text: 'Nginx', link: '/back-end/nginx' },
  { text: 'Linux 命令', link: '/back-end/command' },
  { text: 'vim 编辑器', link: '/back-end/vim' },
]

export const nav = [
  { text: '首页', link: '/' },
  { text: '前端', items: frontItems },
  {
    text: '移动端',
    items: [
      { text: 'Flutter', link: '/flutter' },
      { text: 'Jetpack Compose', link: '/flutter/compose' },
    ],
  },
  { text: 'Cocos', items: cocosNavItems },
  { text: '桌面端', items: electronItems },
  { text: '后端 & 运维', items: backendNavItems },
] satisfies DefaultTheme.NavItem[]

export const sidebar = [
  { text: '前端', items: frontItems },
  {
    text: '移动端',
    items: [
      { text: 'Flutter 介绍', link: '/flutter' },
      { text: 'Flutter', collapsed: false, items: flutterItems },
      { text: 'Jetpack Compose', link: '/flutter/compose' },
    ],
  },
  { text: 'Cocos', items: cocosItems },
  { text: '桌面端', items: electronItems },
  { text: '后端 & 运维', items: backendSidebarItems },
] satisfies DefaultTheme.SidebarItem[]
