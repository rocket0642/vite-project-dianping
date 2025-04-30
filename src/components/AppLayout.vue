<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

// 定义props
defineProps({
  // 是否显示页头
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示页脚
  showFooter: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div class="app-layout">
    <!-- 页头 -->
    <AppHeader v-if="showHeader" />
    
    <!-- 主要内容区 -->
    <main class="main-content">
      <slot></slot>
    </main>
    
    <!-- 页脚 -->
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px 10px;
  }
}
</style>