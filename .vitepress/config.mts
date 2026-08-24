import { defineConfig } from 'vitepress'
import { nav, sidebar } from './navigation'
import timeline from 'vitepress-markdown-timeline'

// GitHub Pages 部署在 /blog/ 子路径，Vercel 和本地开发部署在域名根路径。
// GITHUB_ACTIONS 是 GitHub Actions 始终提供的环境变量，不依赖 Vercel 项目设置。
export const baseUrl = process.env.GITHUB_ACTIONS === 'true' ? '/blog/' : '/'

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
    // 最后更新时间
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
    returnToTopLabel: "返回顶部",
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
    nav,
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/W2XiaoYu' }
    ]
  },

})
