<script setup>
import AppFooter from './AppFooter.vue';
import AppHeader from './AppHeader.vue';
import { onMounted } from 'vue';
import { useUserStore } from '../stores/user';

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

const userStore = useUserStore();

onMounted(() => {
  // 在组件挂载时检查登录状态
  if (!userStore.isLogin) {
    userStore.checkLoginStatus(); // 添加一个方法来验证token是否有效
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
  padding: 10px 20px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px 10px;
  }
}
</style>