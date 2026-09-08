<script setup lang="ts">
import { withBase } from 'vitepress'

const articles = [
  {
    number: '01', category: '前端 · 交互细节',
    title: '让主题切换，自然发生',
    description: '用 View Transitions API 实现明暗主题的圆形扩散，拆解动画背后的原理与细节。',
    href: '/front/view-transition-theme',
  },
  {
    number: '02', category: 'Flutter · 性能实践',
    title: '把桌面应用的内存降下来',
    description: '从流式读取、图片缓存到列表布局，记录 Flutter Windows 应用的内存优化过程。',
    href: '/flutter/memory-optimization',
  },
  {
    number: '03', category: 'Electron · 工程化',
    title: '让代码签名成为构建的一部分',
    description: '串起证书、配置与打包脚本，让 Electron 应用的自动签名有迹可循。',
    href: '/electron/code-signing',
  },
  {
    number: '04', category: '后端 · 数据库设计',
    title: '一个用户，多种登录方式',
    description: '用 GORM 与 PostgreSQL 拆分账号和身份，理清多账号登录与合并的边界。',
    href: '/back-end/database-design/multi-account-auth-merge',
  },
]

const topics = [
  { name: '前端', detail: 'Vue / React / TypeScript', href: '/front' },
  { name: '移动端', detail: 'Flutter / Compose', href: '/flutter' },
  { name: 'Cocos', detail: '节点 / 动画 / 2D', href: '/cocos' },
  { name: '桌面端', detail: 'Electron / Windows', href: '/electron' },
  { name: '后端与运维', detail: 'Go / 数据库 / Linux', href: '/back-end' },
]
</script>

<template>
  <main class="editorial-home" aria-labelledby="home-title">
    <header class="home-intro">
      <p class="eyebrow">NOTES <span aria-hidden="true">/</span> CONGWONG</p>
      <div class="intro-grid">
        <div>
          <h1 id="home-title">在实践中探索，<br>在记录中沉淀。</h1>
          <p class="intro-description">我是 CongWong。一边写代码，一边整理思路。<br class="desktop-break">这里存放前端、跨端与后端开发中的实践，也留下那些值得再读一次的细节。</p>
          <a class="intro-link" href="#selected-notes">从几篇笔记开始 <span aria-hidden="true">↓</span></a>
        </div>
        <aside class="intro-note" aria-label="关于这些笔记">
          <span class="note-label">A PERSONAL NOTEBOOK</span>
          <p>不急于给出答案，<br>先把走过的路记下来。</p>
          <span class="note-caption">代码 · 思考 · 日常积累</span>
        </aside>
      </div>
    </header>

    <section id="selected-notes" class="selected-notes" aria-labelledby="selected-title">
      <div class="section-heading">
        <h2 id="selected-title">精选笔记 <span>SELECTED NOTES</span></h2>
        <span class="section-caption">从一个问题，到一次实践</span>
      </div>
      <div class="article-grid">
        <a v-for="(article, i) in articles" :key="article.href" class="article-link" :href="withBase(article.href)" :style="{ '--i': i }">
          <div class="article-meta"><span>{{ article.category }}</span><span class="article-number">{{ article.number }}</span></div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.description }}</p>
          <span class="article-read">阅读笔记 <span aria-hidden="true">↗</span></span>
        </a>
      </div>
    </section>

    <section class="topics" aria-labelledby="topics-title">
      <div class="section-heading">
        <h2 id="topics-title">按主题浏览 <span>EXPLORE</span></h2>
      </div>
      <div class="topic-grid">
        <a v-for="(topic, i) in topics" :key="topic.href" :href="withBase(topic.href)" class="topic-link" :style="{ '--i': i }">
          <span class="topic-name">{{ topic.name }} <span aria-hidden="true">↗</span></span>
          <span class="topic-detail">{{ topic.detail }}</span>
        </a>
      </div>
    </section>

    <footer class="home-colophon">
      <span>CONGWONG <span aria-hidden="true">/</span> 随心记录，慢慢积累。</span>
      <a class="colophon-about" :href="withBase('/about')">关于我 <span aria-hidden="true">↗</span></a>
      <span>人生到处知何似，应似飞鸿踏雪泥。</span>
    </footer>
  </main>
</template>

<style scoped>
.editorial-home {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}
.home-intro { padding: 78px 0 66px; }
.eyebrow, .note-label, .section-heading h2 span, .article-number, .home-colophon {
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .13em;
}
.eyebrow { color: var(--vp-c-text-2); margin: 0 0 34px; }
.eyebrow span { color: var(--vp-c-brand-1); padding: 0 12px; }
.intro-grid { display: grid; grid-template-columns: minmax(0, 1fr) 235px; gap: 48px; align-items: end; }
h1 {
  font-family: var(--notes-font-editorial);
  font-size: clamp(36px, 4.5vw, 58px);
  font-weight: 600;
  letter-spacing: -.035em;
  line-height: 1.45;
  margin: 0;
}
.intro-description { color: var(--vp-c-text-2); font-size: 17px; line-height: 1.95; max-width: 560px; margin: 24px 0; }
.intro-link { display: inline-flex; align-items: center; gap: 20px; color: var(--vp-c-brand-1); font-size: 14px; font-weight: 500; padding: 8px 0; border-bottom: 1px solid var(--vp-c-brand-1); }
.intro-note { border-left: 1px solid var(--vp-c-divider); padding: 4px 0 4px 25px; margin-bottom: 9px; }
.note-label { font-size: 10px; color: var(--vp-c-text-2); letter-spacing: .12em; }
.intro-note p { font-family: var(--notes-font-editorial); font-size: 18px; line-height: 1.9; margin: 18px 0; }
.note-caption { color: var(--vp-c-text-2); font-size: 12px; letter-spacing: .05em; }
.selected-notes { scroll-margin-top: 100px; }
.section-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 22px 0; border-top: 1px solid var(--vp-c-text-1); }
.section-heading h2 { font-size: 18px; font-weight: 600; margin: 0; line-height: 1.7; }
.section-heading h2 span { color: var(--vp-c-text-2); font-size: 11px; margin-left: 16px; }
.section-caption { color: var(--vp-c-text-2); font-size: 13px; }
.article-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px; }
.article-link { display: flex; flex-direction: column; align-items: flex-start; padding: 26px 0 25px; border-top: 1px solid var(--vp-c-divider); }
.article-meta { display: flex; justify-content: space-between; width: 100%; gap: 20px; color: var(--vp-c-text-2); font-size: 12px; letter-spacing: .06em; }
.article-number { color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.article-link h3 {
  font-family: var(--notes-font-editorial);
  font-size: 24px;
  line-height: 1.55;
  font-weight: 600;
  letter-spacing: -.02em;
  margin: 17px 0 10px;
  position: relative;
  transition: color .2s ease;
}
.article-link h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 0;
  height: 1px;
  background: var(--vp-c-brand-1);
  transition: width .35s cubic-bezier(.25, .7, .3, 1);
}
.article-link p { color: var(--vp-c-text-2); font-size: 15px; line-height: 1.85; margin: 0 0 21px; max-width: 430px; }
.article-read { color: var(--vp-c-brand-1); font-size: 13px; margin-top: auto; display: flex; gap: 14px; align-items: center; }
.article-read > span { transition: transform .25s ease; }
.article-link:hover h3, .topic-link:hover .topic-name { color: var(--vp-c-brand-1); }
.article-link:hover h3::after { width: 100%; }
.article-link:hover .article-read > span { transform: translate(3px, -3px); }
.topic-link:hover .topic-name > span { transform: translate(3px, -3px); }
.intro-link:hover { color: var(--vp-c-text-1); }
.topics { margin-top: 44px; }
.topic-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); padding: 8px 0 30px; gap: 24px; }
.topic-link { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.topic-name { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 16px; transition: color .15s; }
.topic-name > span { font-size: 13px; color: var(--vp-c-text-2); transition: transform .25s ease; }
.topic-detail { font-size: 12px; color: var(--vp-c-text-2); line-height: 1.7; }
.home-colophon { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; color: var(--vp-c-text-2); letter-spacing: .04em; line-height: 1.8; border-top: 1px solid var(--vp-c-divider); padding: 25px 0 36px; }
.home-colophon span span { padding: 0 8px; }
.colophon-about { color: var(--vp-c-brand-1); }
.colophon-about:hover { color: var(--vp-c-text-1); }
a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 6px; border-radius: 2px; }

/* 入场动画：首屏依次浮现，半秒内完成，只播一次 */
@keyframes home-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.eyebrow, h1, .intro-description, .intro-link, .intro-note,
.selected-notes .section-heading, .article-link,
.topics .section-heading, .topic-link, .home-colophon {
  animation: home-rise .6s cubic-bezier(.25, .7, .3, 1) both;
}
h1 { animation-delay: .05s; }
.intro-description { animation-delay: .12s; }
.intro-link { animation-delay: .2s; }
.intro-note { animation-delay: .26s; }
.selected-notes .section-heading { animation-delay: .3s; }
.article-link { animation-delay: calc(.36s + var(--i, 0) * .06s); }
.topics .section-heading { animation-delay: .5s; }
.topic-link { animation-delay: calc(.56s + var(--i, 0) * .04s); }
.home-colophon { animation-delay: .66s; }

@media (max-width: 959px) {
  .editorial-home { padding: 0 32px; }
  .home-intro { padding-top: 56px; }
  .intro-grid { grid-template-columns: minmax(0, 1fr); }
  .intro-note { display: none; }
  .topic-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 639px) {
  .editorial-home { padding: 0 20px; }
  .home-intro { padding: 44px 0 44px; }
  .eyebrow { margin-bottom: 24px; }
  h1 { font-size: clamp(30px, 7.6vw, 44px); }
  .intro-description { font-size: 16px; margin-top: 20px; }
  .desktop-break { display: none; }
  .section-caption { display: none; }
  .article-grid { grid-template-columns: minmax(0, 1fr); }
  .article-link { padding: 24px 0; }
  .article-link h3 { font-size: 21px; }
  .topics { margin-top: 28px; }
  .topic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 28px; }
  .home-colophon { flex-direction: column; gap: 8px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .eyebrow, h1, .intro-description, .intro-link, .intro-note,
  .selected-notes .section-heading, .article-link,
  .topics .section-heading, .topic-link, .home-colophon {
    animation: none;
  }
  .article-link h3, .article-link h3::after, .article-read > span,
  .topic-name > span { transition: none; }
}
</style>
