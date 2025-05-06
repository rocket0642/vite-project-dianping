<script setup>
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElButton, ElCard, ElEmpty, ElOption, ElPagination, ElSelect, ElSkeleton } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import ShopCard from '../../components/ShopCard.vue'
import ShopTypeNav from '../../components/ShopTypeNav.vue'
import { useShopStore } from '../../stores/shop'

// 路由实例
const route = useRoute()

// 商铺状态管理
const shopStore = useShopStore()

// 状态
const typeId = ref(parseInt(route.params.typeId))
const typeName = ref('')
const shops = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)
const sortBy = ref('score') // 排序字段
const sortOrder = ref('desc') // 排序方向

// 排序选项
const sortOptions = [
  { value: 'score', label: '按评分排序' },
  { value: 'sold', label: '按销量排序' },
  { value: 'avg_price', label: '按均价排序' }
]

/**
 * 加载分类商铺数据
 */
const loadTypeShops = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 添加排序参数
    if (sortBy.value) {
      params.sortBy = sortBy.value
      params.sortOrder = sortOrder.value
    }
    
    const result = await shopStore.fetchShopsByType(typeId.value, params)
    shops.value = result.list
    total.value = result.total
    
    // 获取分类名称
    if (shopStore.shopTypeList.length === 0) {
      await shopStore.fetchShopTypes()
    }
    
    const type = shopStore.shopTypeList.find(t => t.id === typeId.value)
    typeName.value = type ? type.name : '未知分类'
    
  } catch (error) {
    console.error('加载分类商铺失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 页码变化处理
 */
const handleCurrentChange = (current) => {
  currentPage.value = current
  loadTypeShops()
}

/**
 * 排序变化处理
 */
const handleSortChange = (value) => {
  // 如果切换了排序字段，重置为默认降序
  if (sortBy.value !== value) {
    sortBy.value = value
    sortOrder.value = 'desc'
  }
  currentPage.value = 1 // 切换排序时重置页码
  loadTypeShops()
}

/**
 * 切换排序方向
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  loadTypeShops()
}

// 监听路由参数变化
watch(() => route.params.typeId, (newTypeId) => {
  typeId.value = parseInt(newTypeId)
  currentPage.value = 1
  loadTypeShops()
})

// 挂载时加载数据
onMounted(() => {
  loadTypeShops()
})
</script>

<template>
  <AppLayout>
    <div class="shop-type-container">
      <!-- 商铺类型导航 - 结构与首页保持一致 -->
      <ShopTypeNav />
      
      <div class="type-header">
        <div class="header-row">
          <h1 class="type-title">{{ typeName }}</h1>
          
          <!-- 排序选项 -->
          <div class="sort-options">
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              style="width: 140px"
              @change="handleSortChange"
            >
              <el-option
                v-for="item in sortOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            
            <!-- 升序/降序切换按钮 -->
            <el-button 
              v-if="sortBy" 
              type="primary" 
              size="small"
              :icon="sortOrder === 'desc' ? ArrowDown : ArrowUp"
              @click="toggleSortOrder"
            >
              {{ sortOrder === 'desc' ? '从高到低' : '从低到高' }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 分类商铺列表 -->
      <el-skeleton :loading="loading" animated :count="4">
        <template #template>
          <div class="skeleton-container">
            <el-card v-for="i in 8" :key="i" class="skeleton-card">
              <template #default>
                <el-skeleton-item variant="image" style="width: 100%; height: 160px;" />
                <el-skeleton-item variant="h3" style="width: 70%; margin: 10px 0;" />
                <el-skeleton-item variant="text" style="width: 50%;" />
              </template>
            </el-card>
          </div>
        </template>
        
        <template #default>
          <div v-if="shops.length > 0" class="shop-results">
            <div class="shop-grid">
              <div v-for="shop in shops" :key="shop.id" class="shop-item">
                <ShopCard :shop="shop" />
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-if="total > 0"
                layout="prev, pager, next"
                :total="total"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
          
          <el-empty v-else description="暂无商铺" />
        </template>
      </el-skeleton>
    </div>
  </AppLayout>
</template>

<style scoped>
.shop-type-container {
  padding: 10px 20px; /* 减小上下内边距 */
  max-width: 1200px;
  margin: 0 auto;
}

/* 确保类别导航与首页完全一致 */
:deep(.shop-type-nav) {
  width: 100%;
  margin-bottom: 20px;
}

.type-header {
  margin-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-title {
  font-size: 24px;
  position: relative;
  padding-left: 12px;
  margin-bottom: 0; /* 修改margin以适应flex布局 */
}

.type-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 40px;
}

.skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card {
  height: 280px;
}
</style>
