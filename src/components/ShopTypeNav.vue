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
        <!-- <el-icon><component :is="type.icon" /></el-icon> -->
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
  margin-bottom: 15px; /* 减小下边距 */
  padding: 5px; /* 减小内边距 */
  height: 80px; /* 减小固定高度 */
  display: flex;
  align-items: center;
}

.type-container {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  padding: 0; /* 移除上下内边距 */
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  flex: 1; /* 每个项目占据相同宽度 */
  max-width: 100px; /* 可选：限制最大宽度 */
  transition: transform 0.3s ease, color 0.3s;
}

.type-item:hover {
  transform: translateY(-5px);
}

.type-item .el-icon {
  font-size: 22px; /* 稍微减小图标大小 */
  color: #409EFF;
  margin-bottom: 5px; /* 减小图标与文字间距 */
  transition: transform 0.3s ease;
}

.type-item:hover .el-icon {
  transform: scale(1.2);
}

.type-item span {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-item {
    min-width: 70px;
    margin: 0 5px;
  }
}

/* 修改后的样式 */
.category-nav {
  display: flex;
  justify-content: space-evenly; /* 均匀分布所有元素 */
  align-items: center;
  width: 100%;
  padding: 15px 0;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;  /* 每个项目占据相等的空间 */
}

.category-icon {
  margin-bottom: 8px;
}
</style>
