<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '../stores/shop'

// 路由实例
const router = useRouter()

// 商铺状态管理
const shopStore = useShopStore()

// 商铺类型列表
const shopTypes = ref([])

// 是否正在加载
const loading = ref(false)

/**
 * 跳转到商铺分类页
 * @param {number} typeId - 商铺类型ID
 */
const goToShopType = (typeId) => {
  router.push(`/shop/type/${typeId}`)
}

/**
 * 组件挂载时加载商铺类型数据
 */
onMounted(async () => {
  loading.value = true
  try {
    // 从store获取商铺类型，如果store中没有，则从API获取
    if (shopStore.shopTypeList.length === 0) {
      await shopStore.fetchShopTypes()
    }
    shopTypes.value = shopStore.shopTypeList
  } catch (error) {
    console.error('加载商铺类型失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="shop-type-nav">
    <div class="type-container">
      <div 
        v-for="type in shopTypes" 
        :key="type.id" 
        class="type-item"
        @click="goToShopType(type.id)"
      >
        <el-icon><component :is="type.icon" /></el-icon>
        <span>{{ type.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-type-nav {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 20px;
  padding: 15px 10px;
}

.type-container {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-bottom: 5px;
}

.type-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  margin: 0 10px;
  cursor: pointer;
  transition: transform var(--transition-duration);
  flex-shrink: 0;
}

.type-item:hover {
  transform: translateY(-3px);
}

.type-item .el-icon {
  font-size: 24px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-item {
    min-width: 70px;
    margin: 0 5px;
  }
}
</style>
