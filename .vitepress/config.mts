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
          { text: "代码片段", link: '/front/codeSnippet' },
          {
            text: "Vue",
            link: '/front/vue'
          }, {
            text: "React",
            link: '/front/react'
          },
        ]
      },
      { text: 'Flutter', link: '/flutter' },
      { text: '挪车二维码', link: '/qrcode' },
    ],
    sidebar: [
      {
        text: '前端',
        items: [
          { text: 'Vue', link: '/front/vue' },
          { text: 'React', link: '/front/react' }
        ]
      },
      {
        text: "Linux",
        items: [
          { text: 'Nginx', link: '/linux/nginx' },
          { text: 'Linux命令', link: '/linux/command' },
          {
            text: "vim编辑器",
            link: '/linux/vim'
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/W2XiaoYu' }
    ]
  },

})
