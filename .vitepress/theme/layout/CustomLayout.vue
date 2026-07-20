<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'
import useSpendTime from '../../hooks/useSpendTime'
import BackToTop from '../components/BackToTop.vue'
const { isDark } = useData()
const { text, textStyle, colorStyle } = useSpendTime()

const enableTransitions = () =>
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
    if (!enableTransitions()) {
        isDark.value = !isDark.value
        return
    }

    // 记录切换前的状态（切换后 isDark 会变，所以提前取）
    const willBeDark = !isDark.value
    const root = document.documentElement

    // 设置点击坐标 CSS 变量 + 方向 class，动画由 CSS @keyframes 驱动
    root.classList.remove('theme-grow', 'theme-shrink')
    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    void root.offsetWidth
    root.classList.add(willBeDark ? 'theme-grow' : 'theme-shrink')

    const transition = document.startViewTransition(async () => {
        isDark.value = !isDark.value
        await nextTick()
    })

    transition.finished.then(() => {
        root.classList.remove('theme-grow', 'theme-shrink')
    })
})
</script>

<template>
    <DefaultTheme.Layout>
        <template #doc-before>
            <span :style="textStyle">
                <span :style="colorStyle">{{ text }}</span>
            </span>
        </template>
        <template #doc-after>
            <BackToTop />
        </template>
    </DefaultTheme.Layout>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    overflow: hidden;
}

.theme-grow::view-transition-old(root) { z-index: 1; }
.theme-grow::view-transition-new(root) {
    z-index: 9999;
    animation: theme-grow 400ms ease-in-out forwards;
}

.theme-shrink::view-transition-old(root) {
    z-index: 9999;
    animation: theme-shrink 400ms ease-in-out forwards;
}
.theme-shrink::view-transition-new(root) { z-index: 1; }

@keyframes theme-grow {
    from { clip-path: circle(0px at var(--theme-x) var(--theme-y)); }
    to   { clip-path: circle(150% at var(--theme-x) var(--theme-y)); }
}

@keyframes theme-shrink {
    from { clip-path: circle(150% at var(--theme-x) var(--theme-y)); }
    to   { clip-path: circle(0px at var(--theme-x) var(--theme-y)); }
}

.VPSwitchAppearance {
    width: 22px !important;
}
.VPSwitchAppearance .check {
    transform: none !important;
}
</style>
