<script setup>
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElButton, ElCard, ElEmpty, ElOption, ElPagination, ElSelect, ElSkeleton, ElTabPane, ElTabs } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import ShopCard from '../../components/ShopCard.vue'
import { useGoodsStore } from '../../stores/goods'
import { useShopStore } from '../../stores/shop'

// 路由相关
const route = useRoute()
const router = useRouter()

// 商铺状态管理
const shopStore = useShopStore()
// 商品状态管理
const goodsStore = useGoodsStore()
// 状态
const loading = ref(false)
const shops = ref([])
const goods = ref([])
const total = ref(0)
const activeTab = ref('shop')

// 排序相关
const sortBy = ref('sold')
const sortOrder = ref('desc')

// 商铺排序选项
const shopSortOptions = [
  { value: 'score', label: '按评分排序' },
  { value: 'sold', label: '按销量排序' },
  { value: 'avg_price', label: '按均价排序' }
]

// 商品排序选项
const goodsSortOptions = [
  { value: 'price', label: '按价格排序' },
  { value: 'sold', label: '按销量排序' }
]

// 搜索条件
const searchForm = reactive({
  keyword: '',
  current: 1,
  pageSize: 9,
  sortBy: 'sold',
  sortOrder: 'desc'
})

/**
 * 执行商铺搜索
 */
const searchShops = async () => {
  loading.value = true
  try {
    const { keyword, ...params } = searchForm
    const result = await shopStore.searchShopsByKeyword(keyword, params)
    shops.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('搜索商铺失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 执行商品搜索
 */
const searchGoodsItems = async () => {
  loading.value = true
  try {
    const { keyword, ...params } = searchForm
    const result = await goodsStore.searchGoodsByKeyword(keyword, params)
    goods.value = result.list
    total.value = result.total
    console.log(goods.value)
    console.log(total.value)
  } catch (error) {
    console.error('搜索商品失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 页码变化处理
 */
const handleCurrentChange = (current) => {
  searchForm.current = current
  
  if (activeTab.value === 'shop') {
    searchShops()
  } else {
    searchGoodsItems()
  }
  
  // 更新URL参数但不重新加载页面
  router.push({
    query: { ...route.query, page: current }
  })
}

/**
 * 标签页切换处理
 */
const handleTabChange = (tab) => {
  activeTab.value = tab
  
  // 切换标签页时重置排序
  sortBy.value = 'sold'
  sortOrder.value = 'desc'
  searchForm.sortBy = 'sold'
  searchForm.sortOrder = 'desc'
  
  if (tab === 'shop') {
    searchShops()
  } else {
    searchGoodsItems()
  }
  
  // 更新URL
  router.push({
    query: { ...route.query, type: tab }
  })
}

/**
 * 排序变化处理
 */
const handleSortChange = (value) => {
  if (sortBy.value !== value) {
    sortBy.value = value
    sortOrder.value = 'desc'
  }
  
  searchForm.sortBy = value
  searchForm.sortOrder = sortOrder.value
  searchForm.current = 1 // 切换排序时重置页码
  
  if (activeTab.value === 'shop') {
    searchShops()
  } else {
    searchGoodsItems()
  }
  
  // 更新URL
  router.push({
    query: { 
      ...route.query, 
      sortBy: value,
      sortOrder: sortOrder.value,
      page: 1
    }
  })
}

/**
 * 切换排序方向
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  searchForm.sortOrder = sortOrder.value
  
  if (activeTab.value === 'shop') {
    searchShops()
  } else {
    searchGoodsItems()
  }
  
  // 更新URL
  router.push({
    query: { 
      ...route.query, 
      sortOrder: sortOrder.value 
    }
  })
}

/**
 * 跳转到商品详情
 */
const goToGoodsDetail = (goodsId) => {
  router.push(`/product/${goodsId}`)
}

/**
 * 跳转到商铺详情
 */
const goToShopDetail = (shopId) => {
  router.push(`/shop/${shopId}`)
}

/**
 * 从URL参数更新搜索条件
 */
const updateSearchFromQuery = () => {
  const { keyword, type, page, sortBy: querySortBy, sortOrder: querySortOrder } = route.query
  searchForm.keyword = keyword || ''
  searchForm.type = type || 'shop'
  searchForm.current = parseInt(page) || 1
  searchForm.sortBy = querySortBy || 'sold'
  searchForm.sortOrder = querySortOrder || 'desc'
  
  activeTab.value = type || 'shop'
  sortBy.value = querySortBy || 'sold'
  sortOrder.value = querySortOrder || 'desc'
  
  // 执行搜索
  if (activeTab.value === 'shop') {
    searchShops()
  } else {
    searchGoodsItems()
  }
}

// 监听路由参数变化
watch(() => route.query, updateSearchFromQuery, { immediate: true })

// 挂载时初始化
onMounted(() => {
  updateSearchFromQuery()
})
</script>

<template>
  <AppLayout>
    <div class="search-container">
      <div class="search-header">
        <h1 class="search-title">搜索结果: {{ searchForm.keyword }}</h1>
        <div class="search-filter">
          <div class="filter-container">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane label="商铺" name="shop"></el-tab-pane>
              <el-tab-pane label="商品" name="goods"></el-tab-pane>
            </el-tabs>
            
            <!-- 排序选项 -->
            <div class="sort-options">
              <el-select
                v-model="sortBy"
                placeholder="排序方式"
                style="width: 140px"
                @change="handleSortChange"
              >
                <el-option
                  v-for="item in activeTab === 'shop' ? shopSortOptions : goodsSortOptions"
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
      </div>
      
      <!-- 搜索结果 -->
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
          <!-- 商铺搜索结果 -->
          <div v-if="activeTab === 'shop'" class="search-results">
            <div v-if="shops.length > 0" class="shop-grid">
              <div v-for="shop in shops" :key="shop.id" class="shop-item">
                <ShopCard :shop="shop" />
              </div>
            </div>
            <el-empty v-else description="暂无商铺搜索结果" />
          </div>
          
          <!-- 商品搜索结果 -->
          <div v-else class="search-results">
            <div v-if="goods.length > 0" class="goods-grid">
              <el-card 
                v-for="item in goods" 
                :key="item.id" 
                class="goods-card"
                @click="goToGoodsDetail(item.id)"
              >
                <div class="goods-card-content">
                  <div class="goods-image">
                    <el-image :src="item.images" fit="cover" />
                  </div>
                  <div class="goods-info">
                    <h3 class="goods-name">{{ item.name }}</h3>
                    <div class="goods-price">
                      <span class="price">¥{{ (item.price / 100).toFixed(2) }}</span>
                      <span v-if="item.originalPrice" class="original">
                        ¥{{ (item.originalPrice / 100).toFixed(2) }}
                      </span>
                    </div>
                    <div class="goods-sold">已售{{ item.sold }}件</div>
                    <div class="shop-info" @click.stop="goToShopDetail(item.shopId)">
                      <div class="shop-name">{{ item.shopName }}</div>
                      <div class="shop-rating">评分: {{ (item.score / 10).toFixed(1) }}</div>
                      <div class="shop-address">地址：{{ item.address }}</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
            <el-empty v-else description="暂无商品搜索结果" />
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="total > 0">
            <el-pagination
              layout="prev, pager, next"
              :total="total"
              :page-size="searchForm.pageSize"
              :current-page="searchForm.current"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-skeleton>
    </div>
  </AppLayout>
</template>

<style scoped>
.search-container {
  padding: 20px;
}

.search-header {
  margin-bottom: 20px;
}

.search-title {
  font-size: 24px;
  margin-bottom: 15px;
}

.search-filter {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.goods-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.goods-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.goods-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.goods-card-content {
  display: flex;
}

.goods-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.goods-info {
  flex: 1;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
}

.goods-price {
  margin-bottom: 8px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f60;
  margin-right: 8px;
}

.original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.goods-sold {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.shop-info {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
}

.shop-info:hover .shop-name {
  color: #409EFF;
}

.shop-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.shop-rating {
  font-size: 13px;
  color: #f60;
  margin-bottom: 5px;
}

.shop-address {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-options {
    margin-top: 15px;
  }
  
  .goods-card-content {
    flex-direction: column;
  }
  
  .goods-image {
    width: 100%;
    height: 180px;
    margin-bottom: 10px;
  }
  
  .goods-info {
    padding-left: 0;
  }
}
</style>
