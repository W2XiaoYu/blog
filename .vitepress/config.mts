import { defineConfig } from 'vitepress'
export const baseUrl = '/blog/'
import timeline from "vitepress-markdown-timeline";
export default defineConfig({
  base: baseUrl,
  title: "CongWong的笔记",
  description: "记录自己",
  head: [
    ['link', { rel: 'icon', href: baseUrl + 'favicon.ico' }]
  ],
  srcDir: "src",

  lang: "zh-CN",
  markdown: {
    lineNumbers: true,
    config(md) {
      md.use(timeline)
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
        }
      }
    },
    //最后更新时间
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },
    outline: {
      level: [2, 6], // 显示 2 到 6 级标题作为大纲
      label: '目录' // 大纲标题
    },
    // 返回顶部 Return to top
    returnToTopLabel: "返回顶部",
    // 菜单  Menu
    sidebarMenuLabel: "菜单",
    notFound: {
      title: "界面未找到",
      quote: "您好像迷失在网络的小胡同里啦，别着急，赶紧回头是岸！",
      linkText: "返回首页"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    logo: '/image/8858-82f0b068a02e745a3716c87d871cf979.jpg',
    nav: [
      { text: '首页', link: '/' },
      {
        text: '前端', items: [
          { text: "Vue", link: '/front/vue' },
          { text: "React", link: '/front/react' },
          { text: "View Transitions 主题切换", link: '/front/view-transition-theme' },
          { text: "TypeScript Utility Types", link: '/front/typescript-utility-types' },
          { text: "代码片段", link: '/front/code-snippets' },
        ]
      },
      {
        text: '移动端', items: [
          { text: 'Flutter', link: '/flutter' },
          { text: 'Jetpack Compose', link: '/flutter/compose' },
        ]
      },
      {
        text: '桌面端', items: [
          { text: '全局屏幕取色器', link: '/electron/color-picker' },
          { text: '打包自动代码签名', link: '/electron/code-signing' },
          { text: '透明窗口 slider 拖拽光标', link: '/electron/slider-drag-cursor' },
        ]
      },
      {
        text: '后端 & 运维', items: [
          { text: 'Go 语言', link: '/back-end/go' },
          { text: 'Docker 部署', link: '/back-end/docker-deploy' },
          { text: 'Nginx', link: '/back-end/nginx' },
          { text: 'Linux 命令', link: '/back-end/command' },
          { text: 'vim 编辑器', link: '/back-end/vim' },
        ]
      },
    ],
    sidebar: [
      {
        text: '前端',
        items: [
          { text: 'Vue', link: '/front/vue' },
          { text: 'React', link: '/front/react' },
          { text: 'View Transitions 主题切换', link: '/front/view-transition-theme' },
          { text: 'TypeScript Utility Types', link: '/front/typescript-utility-types' },
          { text: '代码片段', link: '/front/code-snippets' },
        ]
      },
      {
        text: '移动端',
        items: [
          { text: 'Flutter 介绍', link: '/flutter' },
          {
            text: 'Flutter',
            collapsed: false,
            items: [
              { text: '打包构建', link: '/flutter/packaging' },
              { text: '安卓原生', link: '/flutter/android-native' },
              { text: 'Windows 桌面', link: '/flutter/windows-desktop' },
              { text: '桌面内存优化', link: '/flutter/memory-optimization' },
              { text: '自定义拖拽与拖拽加密', link: '/flutter/custom-drag-encryption' },
              { text: '代码片段', link: '/flutter/code-snippets' },
            ]
          },
          { text: 'Jetpack Compose', link: '/flutter/compose' },
        ]
      },
      {
        text: '桌面端',
        items: [
          { text: '全局屏幕取色器', link: '/electron/color-picker' },
          { text: '打包自动代码签名', link: '/electron/code-signing' },
          { text: '透明窗口 slider 拖拽光标', link: '/electron/slider-drag-cursor' }
        ]
      },
      {
        text: '后端 & 运维',
        items: [
          { text: 'Go 语言', link: '/back-end/go' },
          { text: 'Docker 部署', link: '/back-end/docker-deploy' },
          { text: 'Nginx', link: '/back-end/nginx' },
          { text: 'Linux 命令', link: '/back-end/command' },
          { text: 'vim 编辑器', link: '/back-end/vim' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/W2XiaoYu' }
    ]
  },

})
