<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElImage, ElTabs, ElTabPane, ElRate, ElIcon, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { Location, Clock, Phone, Collection, Star } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { useShopStore } from '../../stores/shop'
import { useGoodsStore } from '../../stores/goods'
import { getShopGoods } from '../../api/goods'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const shopId = parseInt(route.params.id)

// 商铺状态管理
const shopStore = useShopStore()

// 商品状态管理
const goodsStore = useGoodsStore()

// 状态
const loading = ref(true)
const shop = ref({})
const activeTab = ref('info')
const isCollected = ref(false) // 假设初始未收藏
const shopGoods = ref([])

/**
 * 加载商铺详情数据
 */
const loadShopDetail = async () => {
  loading.value = true
  try {
    await shopStore.fetchShopDetail(shopId)
    shop.value = shopStore.currentShop
  } catch (error) {
    console.error('加载商铺详情失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 切换收藏状态
 */
const toggleCollection = () => {
  isCollected.value = !isCollected.value
  // 这里应该调用实际的收藏/取消收藏接口
}

/**
 * 加载商铺商品列表
 */
const loadShopGoods = async () => {
  try {
    const res = await getShopGoods(shopId)
    if (res.success) {
      shopGoods.value = res.data
    }
  } catch (error) {
    console.error('加载商铺商品失败:', error)
  }
}

/**
 * 跳转到商品详情页
 */
const goToGoodsDetail = (goodsId) => {
  router.push(`/product/${goodsId}`)
}

/**
 * 在 activeTab 变更时加载商品
 */
watch(activeTab, (newTab) => {
  if (newTab === 'goods' && shopGoods.value.length === 0) {
    loadShopGoods()
  }
})

/**
 * 页面挂载时加载数据
 */
onMounted(() => {
  loadShopDetail()
  loadShopGoods()
})
</script>

<template>
  <AppLayout>
    <div class="shop-detail-container">
      <!-- 加载骨架屏 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-content">
            <div class="skeleton-header">
              <el-skeleton-item variant="image" style="width: 40%; height: 200px" />
              <div style="margin-left: 20px; flex: 1;">
                <el-skeleton-item variant="h3" style="width: 60%; height: 24px; margin-bottom: 15px;" />
                <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 50%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 40%;" />
              </div>
            </div>
            <div class="skeleton-tabs" style="margin-top: 20px;">
              <el-skeleton-item variant="text" style="width: 100%; height: 50px;" />
            </div>
            <div class="skeleton-content" style="margin-top: 20px;">
              <el-skeleton :rows="6" />
            </div>
          </div>
        </template>
        
        <!-- 实际内容 -->
        <template #default>
          <div v-if="shop.id" class="shop-detail">
            <!-- 商铺基本信息 -->
            <div class="shop-header">
              <div class="shop-image">
                <el-image :src="shop.images" fit="cover" />
              </div>
              <div class="shop-info">
                <h1 class="shop-name">{{ shop.name }}</h1>
                <div class="shop-meta">
                  <div class="shop-score">
                    <el-rate 
                      v-model="shop.score" 
                      disabled 
                      show-score 
                      text-color="#ff9900"
                      score-template="{value}"
                    />
                    <span>{{ shop.comments }} 条评价</span>
                  </div>
                  <div class="shop-price">
                    <span class="label">人均:</span>
                    <span class="price">¥{{ shop.avgPrice }}</span>
                  </div>
                  <div class="shop-type">
                    <span class="label">分类:</span>
                    <span>{{ shop.typeName }}</span>
                  </div>
                </div>
                <div class="shop-actions">
                  <el-button 
                    :type="isCollected ? 'danger' : 'primary'" 
                    :icon="Collection"
                    @click="toggleCollection"
                  >
                    {{ isCollected ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 商铺详情选项卡 -->
            <el-tabs v-model="activeTab" class="shop-tabs">
              <el-tab-pane label="商铺信息" name="info">
                <div class="shop-detail-info">
                  <div class="info-item">
                    <el-icon><Location /></el-icon>
                    <span class="label">地址:</span>
                    <span>{{ shop.area }} {{ shop.address }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Clock /></el-icon>
                    <span class="label">营业时间:</span>
                    <span>{{ shop.openHours }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Phone /></el-icon>
                    <span class="label">电话:</span>
                    <span>{{ shop.phone || '暂无' }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Star /></el-icon>
                    <span class="label">销量:</span>
                    <span>{{ shop.sold }}</span>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="商品列表" name="goods">
                <div class="shop-goods">
                  <div v-if="shopGoods.length > 0" class="goods-grid">
                    <div v-for="item in shopGoods" :key="item.id" class="goods-item" @click="goToGoodsDetail(item.id)">
                      <el-image :src="item.imageUrl" fit="cover" class="goods-image" />
                      <div class="goods-info">
                        <h3 class="goods-name">{{ item.name }}</h3>
                        <div class="goods-price">
                          <span class="price">¥{{ (item.price / 100).toFixed(2) }}</span>
                          <span v-if="item.originalPrice" class="original-price">¥{{ (item.originalPrice / 100).toFixed(2) }}</span>
                        </div>
                        <div class="goods-sold">已售 {{ item.sold }}</div>
                      </div>
                    </div>
                  </div>
                  <el-empty v-else description="暂无商品" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="评价" name="comments">
                <div class="shop-comments">
                  <p>评价功能正在开发中...</p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <div v-else class="shop-not-found">
            <h2>商铺不存在或已下架</h2>
            <el-button type="primary" @click="$router.push('/')">
              返回首页
            </el-button>
          </div>
        </template>
      </el-skeleton>
    </div>
  </AppLayout>
</template>

<style scoped>
.shop-detail-container {
  padding: 20px;
}

.shop-header {
  display: flex;
  margin-bottom: 30px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.shop-image {
  width: 40%;
  max-width: 400px;
}

.shop-image .el-image {
  width: 100%;
  height: 100%;
  min-height: 250px;
}

.shop-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 24px;
  margin-bottom: 15px;
}

.shop-meta {
  margin-bottom: 20px;
}

.shop-score, .shop-price, .shop-type {
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.price {
  color: #f60;
  font-weight: bold;
}

.shop-actions {
  margin-top: auto;
}

.shop-tabs {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
}

.shop-detail-info {
  padding: 10px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.info-item .el-icon {
  font-size: 18px;
  color: var(--primary-color);
  margin-right: 8px;
}

.shop-not-found {
  text-align: center;
  padding: 50px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shop-header {
    flex-direction: column;
  }
  
  .shop-image {
    width: 100%;
    max-width: none;
  }
  
  .shop-info {
    padding: 15px;
  }
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.goods-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.goods-item:hover {
  transform: translateY(-5px);
}

.goods-image {
  width: 100%;
  height: 150px;
}

.goods-info {
  padding: 10px;
}

.goods-name {
  font-size: 16px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.price {
  color: #f60;
  font-weight: bold;
  margin-right: 5px;
}

.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.goods-sold {
  font-size: 12px;
  color: #999;
}
</style>
