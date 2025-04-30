<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElPagination, ElEmpty, ElSkeleton, ElCard } from 'element-plus'
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
const pageSize = ref(8)

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
      <!-- 商铺类型导航 -->
      <ShopTypeNav />
      
      <div class="type-header">
        <h1 class="type-title">{{ typeName }}</h1>
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
  padding: 20px;
}

.type-header {
  margin-bottom: 20px;
}

.type-title {
  font-size: 24px;
  position: relative;
  padding-left: 12px;
  margin-bottom: 20px;
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
