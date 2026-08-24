import type { Theme } from 'vitepress'
import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme'
import CustomLayout from './layout/CustomLayout.vue'
import './style.css'
import 'vitepress-markdown-timeline/dist/theme/index.css'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }) {
    app.component(
      'ColorsUtils',
      defineAsyncComponent(() => import('./components/ColorConverter.vue')),
    )
  },
} satisfies Theme
