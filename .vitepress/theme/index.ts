// https://vitepress.dev/guide/custom-theme
// import { h } from 'vue'
// import useLive2d from './layout/Live2d'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ColorsUtils from './components/ColorConverter.vue'
import CustomLayout from './layout/CustomLayout.vue'
import './style.css'
// 只需添加以下一行代码，引入时间线样式
import "vitepress-markdown-timeline/dist/theme/index.css";
export default {
  extends: DefaultTheme,
  Layout: CustomLayout, // 直接将 CustomLayout 作为 Layout
  enhanceApp({ app, router, siteData }) {
    // useLive2d()
    app.component('ColorsUtils', ColorsUtils)
  },
} satisfies Theme
