<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const handleScroll = () => { isVisible.value = window.scrollY > 300 }
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <button v-if="isVisible" type="button" class="back-to-top" aria-label="返回顶部" title="返回顶部" @click="scrollToTop">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 11 6-6 6 6M12 5v14" />
    </svg>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.back-to-top:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.back-to-top:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
@media (max-width: 768px) {
  .back-to-top { right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); }
}
</style>
