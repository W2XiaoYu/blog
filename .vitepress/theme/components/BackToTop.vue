<template>
    <div class="back-to-top" v-if="isVisible" aria-label="返回顶部">
        <svg @click.stop="scrollToTop" class="icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="6740">
            <path
                d="M512 42.666667C252.8 42.666667 42.666667 252.8 42.666667 512s210.133333 469.333333 469.333333 469.333333 469.333333-210.133333 469.333333-469.333333S771.2 42.666667 512 42.666667zM128 512a384 384 0 1 1 768 0 384 384 0 0 1-768 0z m154.282667 16.384a53.333333 53.333333 0 0 1 0-75.434667l161.834666-161.834666a96 96 0 0 1 135.765334 0l161.834666 161.834666a53.333333 53.333333 0 0 1-75.434666 75.434667l-100.949334-100.949333V725.333333a53.333333 53.333333 0 1 1-106.666666 0v-297.898666l-100.949334 100.949333a53.333333 53.333333 0 0 1-75.434666 0z"
                fill="currentColor" p-id="6741" />
        </svg>
    
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
const isVisible = ref(false);
const scrollThreshold = 300; // 滚动超过多少距离显示按钮
const isClient = typeof document !== 'undefined'; // SSR 守卫：服务端渲染时不存在 document


const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // 使用平滑滚动
    });
};

const handleScroll = () => {
    isVisible.value = window.scrollY > scrollThreshold;


};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

// 仅在客户端执行，避免 SSR 阶段访问 document 报错
watchEffect(() => {
    if (!isClient) return;
    if (isVisible.value) {
        document.querySelector('.back-to-top')?.classList.add('active');
    } else {
        document.querySelector('.back-to-top')?.classList.remove('active');
    }
});

</script>

<style scoped>
.back-to-top {
    position: fixed;
    right: 40px;
    bottom: 60px;
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    /* 圆形按钮 */

    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    /* opacity: 0; */
    z-index: 999;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 阴影效果 */
}

.back-to-top:hover {
    background-color: var(--vp-c-bg-alt);
    transform: scale(1.1);
    /* 鼠标悬停时放大效果 */
}

.back-to-top.active {
    opacity: 1;
}

.icon {
    width: 48px;
    height: 48px;
    fill: currentColor;
    /* 使用按钮的文字颜色作为图标颜色 */
}

/* 暗色模式下的样式调整（如果需要特殊处理） */
:root.dark .back-to-top {
    /* 可以在这里添加暗色模式下的特殊样式，例如调整背景色、边框色等 */
    /* 示例：改变背景色 */
    background-color: var(--vp-c-bg-alt);
}

/* 移动端样式（屏幕宽度 ≤ 768px） */
@media (max-width: 768px) {
    .back-to-top {
        /* 位置调整：靠右 16px，底部 16px（更贴近移动端操作习惯） */
        right: 16px;
        bottom: 16px;

        /* 尺寸缩小 */
        width: 40px;
        height: 40px;

        /* 优化拖动体验：允许触摸滚动（避免遮挡内容） */
        touch-action: pan-y;

        /* 透明度优化：滚动时更早显示 */
        &.active {
            opacity: 1 !important;
        }
    }

    /* 隐藏拖动时的放大效果（移动端体验更友好） */
    .back-to-top:hover {
        transform: none;
    }
}
</style>
