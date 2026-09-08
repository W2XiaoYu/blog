<script setup lang="ts">
import { withBase } from 'vitepress'

const stack = [
  { label: '前端 Web', items: 'Vue / React / TypeScript / Vite 与 VitePress' },
  { label: '移动与桌面', items: 'Flutter / Jetpack Compose / Electron' },
  { label: '后端与运维', items: 'Go / Gin / GORM / PostgreSQL / Docker / Nginx' },
  { label: '工具与其他', items: 'Cocos Creator / Git / GitHub Actions / Linux' },
]

const projects = [
  {
    name: '3A 启动器',
    description: 'Electron + React 构建的桌面启动器，管理基于 UE5 的实时渲染器：下载、安装、更新、卸载，以及画廊与资源库。',
  },
  {
    name: 'Windows 差量更新',
    description: '用 Go 与 xdelta3 生成差量补丁，Flutter Windows 端下载校验后静默安装，把发版做成完整链路。思路整理在笔记的更新方案与 Go 脚本两篇里。',
    href: '/back-end/go',
    linkText: '相关笔记',
  },
  {
    name: 'CongWong 的笔记',
    description: '你正在看的这个站点：VitePress 搭建、自定义主题，GitHub Pages 与 Vercel 双部署，推送即自动构建发布。',
    href: '/',
    linkText: '回到首页',
  },
]

const notebook = [
  { name: '前端', detail: 'Vue / React / TypeScript 与页面细节', href: '/front' },
  { name: '移动端', detail: 'Flutter 与 Jetpack Compose', href: '/flutter' },
  { name: '桌面端', detail: 'Electron 与 Windows 实践', href: '/electron' },
  { name: '后端与运维', detail: 'Go / 数据库设计 / 部署', href: '/back-end' },
  { name: 'Cocos', detail: '3.8.x 2D 开发笔记', href: '/cocos' },
]
</script>

<template>
  <main class="about-page" aria-labelledby="about-title">
    <header class="about-intro">
      <p class="eyebrow">ABOUT <span aria-hidden="true">/</span> CONGWONG</p>
      <h1 id="about-title">写代码，也写写字。</h1>
      <p class="intro-description">
        我是 CongWong，一名喜欢把过程记下来的开发者。主力写前端和跨端，也碰后端和部署；
        遇到值得记的问题，就整理成这本笔记——比起答案，更在意把来龙去脉说清楚。
      </p>
    </header>

    <section class="stack" aria-labelledby="stack-title">
      <div class="section-heading">
        <h2 id="stack-title">常用技术 <span>STACK</span></h2>
      </div>
      <div class="stack-grid">
        <div v-for="(group, i) in stack" :key="group.label" class="stack-group" :style="{ '--i': i }">
          <span class="stack-label">{{ group.label }}</span>
          <p class="stack-items">{{ group.items }}</p>
        </div>
      </div>
    </section>

    <section class="projects" aria-labelledby="projects-title">
      <div class="section-heading">
        <h2 id="projects-title">在做的事 <span>PROJECTS</span></h2>
        <span class="section-caption">挑几个说得清楚的</span>
      </div>
      <div class="project-list">
        <article v-for="(project, i) in projects" :key="project.name" class="project-item" :style="{ '--i': i }">
          <div class="project-head">
            <h3>{{ project.name }}</h3>
            <a v-if="project.href" class="project-link" :href="withBase(project.href)">
              {{ project.linkText }} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p>{{ project.description }}</p>
        </article>
      </div>
    </section>

    <section class="notebook" aria-labelledby="notebook-title">
      <div class="section-heading">
        <h2 id="notebook-title">这本笔记 <span>NOTEBOOK</span></h2>
        <span class="section-caption">都在这里了</span>
      </div>
      <div class="notebook-grid">
        <a v-for="(topic, i) in notebook" :key="topic.href" class="notebook-link" :href="withBase(topic.href)" :style="{ '--i': i }">
          <span class="topic-name">{{ topic.name }} <span aria-hidden="true">↗</span></span>
          <span class="topic-detail">{{ topic.detail }}</span>
        </a>
      </div>
    </section>

    <section class="contact" aria-labelledby="contact-title">
      <div class="section-heading">
        <h2 id="contact-title">找到我 <span>CONTACT</span></h2>
      </div>
      <div class="contact-links">
        <a class="contact-link" href="https://github.com/W2XiaoYu" target="_blank" rel="noopener">
          GitHub <span class="contact-value">@W2XiaoYu</span> <span aria-hidden="true">↗</span>
        </a>
        <a class="contact-link" href="mailto:shy67174698@yeah.net">
          Email <span class="contact-value">shy67174698@yeah.net</span>
        </a>
      </div>
    </section>

    <footer class="about-colophon">
      <span>人生到处知何似，应似飞鸿踏雪泥。</span>
    </footer>
  </main>
</template>

<style scoped>
.about-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}
.eyebrow, .section-heading h2 span, .stack-label, .about-colophon {
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .13em;
}
.about-intro { padding: 78px 0 60px; }
.eyebrow { color: var(--vp-c-text-2); margin: 0 0 30px; }
.eyebrow span { color: var(--vp-c-brand-1); padding: 0 12px; }
h1 {
  font-family: var(--notes-font-editorial);
  font-size: clamp(32px, 4vw, 50px);
  font-weight: 600;
  letter-spacing: -.03em;
  line-height: 1.4;
  margin: 0;
}
.intro-description { color: var(--vp-c-text-2); font-size: 17px; line-height: 1.95; max-width: 620px; margin: 26px 0 0; }
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 22px 0;
  border-top: 1px solid var(--vp-c-text-1);
}
.section-heading h2 { font-size: 18px; font-weight: 600; margin: 0; line-height: 1.7; }
.section-heading h2 span { color: var(--vp-c-text-2); font-size: 11px; margin-left: 16px; }
.section-caption { color: var(--vp-c-text-2); font-size: 13px; }
.stack-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; padding: 10px 0 34px; }
.stack-group { display: flex; flex-direction: column; gap: 10px; }
.stack-label { color: var(--vp-c-text-2); font-size: 11px; letter-spacing: .08em; }
.stack-items { font-size: 15px; line-height: 1.9; margin: 0; }
.project-list { display: flex; flex-direction: column; }
.project-item { padding: 26px 0; border-top: 1px solid var(--vp-c-divider); }
.project-item:first-child { border-top: 0; padding-top: 10px; }
.project-head { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; }
.project-item h3 {
  font-family: var(--notes-font-editorial);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -.02em;
  margin: 0;
  transition: color .2s ease;
}
.project-item:hover h3 { color: var(--vp-c-brand-1); }
.project-link { color: var(--vp-c-brand-1); font-size: 13px; white-space: nowrap; }
.project-link > span { transition: transform .25s ease; display: inline-block; }
.project-link:hover > span { transform: translate(3px, -3px); }
.project-item p { color: var(--vp-c-text-2); font-size: 15px; line-height: 1.9; margin: 10px 0 0; max-width: 680px; }
.notebook-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 24px; padding: 10px 0 30px; }
.notebook-link { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.topic-name { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 16px; font-weight: 500; transition: color .15s; }
.topic-name > span { font-size: 13px; color: var(--vp-c-text-2); transition: transform .25s ease; }
.notebook-link:hover .topic-name { color: var(--vp-c-brand-1); }
.notebook-link:hover .topic-name > span { transform: translate(3px, -3px); }
.topic-detail { font-size: 12px; color: var(--vp-c-text-2); line-height: 1.7; }
.contact-links { display: flex; flex-wrap: wrap; gap: 14px 40px; padding: 8px 0 30px; }
.contact-link { display: inline-flex; align-items: baseline; gap: 10px; font-size: 15px; padding: 6px 0; border-bottom: 1px solid var(--vp-c-divider); transition: border-color .2s ease; }
.contact-link:hover { border-color: var(--vp-c-brand-1); }
.contact-value { color: var(--vp-c-text-2); font-size: 14px; }
.about-colophon {
  display: flex;
  color: var(--vp-c-text-2);
  letter-spacing: .04em;
  line-height: 1.8;
  border-top: 1px solid var(--vp-c-divider);
  padding: 25px 0 36px;
}

@keyframes about-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.eyebrow, h1, .intro-description, .section-heading, .stack-group,
.project-item, .notebook-link, .contact-links, .about-colophon {
  animation: about-rise .6s cubic-bezier(.25, .7, .3, 1) both;
}
h1 { animation-delay: .05s; }
.intro-description { animation-delay: .12s; }
.stack .section-heading { animation-delay: .2s; }
.stack-group { animation-delay: calc(.26s + var(--i, 0) * .05s); }
.projects .section-heading { animation-delay: .38s; }
.project-item { animation-delay: calc(.44s + var(--i, 0) * .06s); }
.notebook .section-heading { animation-delay: .54s; }
.notebook-link { animation-delay: calc(.6s + var(--i, 0) * .04s); }
.contact .section-heading { animation-delay: .7s; }
.contact-links { animation-delay: .76s; }
.about-colophon { animation-delay: .84s; }

@media (max-width: 959px) {
  .about-page { padding: 0 32px; }
  .about-intro { padding-top: 56px; }
  .stack-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .notebook-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 639px) {
  .about-page { padding: 0 20px; }
  .about-intro { padding: 44px 0 40px; }
  .eyebrow { margin-bottom: 22px; }
  .intro-description { font-size: 16px; }
  .section-caption { display: none; }
  .stack-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .notebook-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; }
  .project-head { flex-direction: column; gap: 6px; }
  .contact-links { flex-direction: column; gap: 4px; }
}
@media (prefers-reduced-motion: reduce) {
  .eyebrow, h1, .intro-description, .section-heading, .stack-group,
  .project-item, .notebook-link, .contact-links, .about-colophon {
    animation: none;
  }
  .project-item h3, .project-link > span, .topic-name > span { transition: none; }
}
</style>
