<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElImage, ElTabs, ElTabPane, ElRate, ElIcon, ElSkeleton, ElSkeletonItem, ElPagination } from 'element-plus'
import { Location, Clock, Phone, Collection, Star } from '@element-plus/icons-vue'
import AppLayout from '../../components/AppLayout.vue'
import { useShopStore } from '../../stores/shop'
import { useGoodsStore } from '../../stores/goods'
import { getShopGoods } from '../../api/goods'
import { getShopComments } from '../../api/comment'

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
const commentsLoading = ref(false)
const comments = ref([])
const commentsTotal = ref(0)
const commentsPagination = ref({
  current: 1,
  pageSize: 5
})

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
 * 加载商铺评价
 */
const loadShopComments = async () => {
  commentsLoading.value = true
  try {
    const params = {
      shopId: shopId,
      current: commentsPagination.value.current,
      pageSize: commentsPagination.value.pageSize
    }
    const res = await getShopComments(shopId, params)
    
    if (res && res.success) {
      comments.value = res.data || []
      commentsTotal.value = res.total || 0
    } else {
      comments.value = []
      commentsTotal.value = 0
    }
  } catch (error) {
    console.error('加载商铺评价失败:', error)
    comments.value = []
    commentsTotal.value = 0
  } finally {
    commentsLoading.value = false
  }
}

/**
 * 跳转到商品详情页
 */
const goToGoodsDetail = (goodsId) => {
  router.push(`/product/${goodsId}`)
}

/**
 * 处理评价分页变化
 */
const handleCommentsPageChange = (page) => {
  commentsPagination.value.current = page
  loadShopComments()
}

/**
 * 格式化评价日期
 */
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 在 activeTab 变更时加载对应数据
 */
watch(activeTab, (newTab) => {
  if (newTab === 'goods' && shopGoods.value.length === 0) {
    loadShopGoods()
  } else if (newTab === 'comments' && comments.value.length === 0) {
    loadShopComments()
  }
})

/**
 * 页面挂载时加载数据
 */
onMounted(() => {
  loadShopDetail()
  loadShopGoods()
})

// 添加手机号码隐藏方法
const hidePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
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
                  <el-skeleton :loading="commentsLoading" animated :count="3">
                    <template #template>
                      <div class="comment-skeleton" v-for="i in 3" :key="i">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                          <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
                          <div style="margin-left: 10px;">
                            <el-skeleton-item variant="text" style="width: 100px;" />
                          </div>
                        </div>
                        <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 10px;" />
                        <el-skeleton-item variant="p" style="width: 100%;" />
                      </div>
                    </template>
                    
                    <template #default>
                      <div v-if="comments.length > 0" class="comments-list">
                        <div v-for="comment in comments" :key="comment.id" class="comment-item">
                          <div class="comment-header">
                            <div class="user-avatar">
                              <el-image :src="comment.userIcon" fit="cover" />
                            </div>
                            <div class="user-info">
                              <div class="user-name">{{ comment.userNickName }}</div>
                              <div class="comment-phone">{{ hidePhone(comment.userPhone) }}</div>
                              <div class="comment-date">{{ formatDate(comment.createTime) }}</div>
                            </div>
                            <div class="comment-score">
                              <el-rate v-model="comment.score" disabled />
                            </div>
                          </div>
                          <div class="comment-content">
                            {{ comment.content }}
                          </div>
                          <div v-if="comment.images && comment.images.length > 0" class="comment-images">
                            <el-image 
                              v-for="(image, index) in comment.images" 
                              :key="index" 
                              :src="image" 
                              fit="cover"
                              class="comment-image"
                              :preview-src-list="comment.images"
                            />
                          </div>
                          <div class="comment-good-info">
                            <span class="goods-name">{{ comment.goodsName }}</span>
                          </div>
                        </div>
                        
                        <!-- 分页 -->
                        <div class="comments-pagination">
                          <el-pagination
                            v-if="commentsTotal > commentsPagination.pageSize"
                            :current-page="commentsPagination.current"
                            :page-size="commentsPagination.pageSize"
                            :total="commentsTotal"
                            layout="prev, pager, next"
                            @current-change="handleCommentsPageChange"
                          />
                        </div>
                      </div>
                      <el-empty v-else description="暂无评价" />
                    </template>
                  </el-skeleton>
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

/* 评价样式 */
.comments-list {
  padding: 10px 0;
}

.comment-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.user-avatar .el-image {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 3px;
}

.comment-phone {
  font-size: 12px;
  color: #999;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-score {
  margin-left: auto;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}

.comment-good-info {
  background-color: #f8f8f8;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  display: inline-block;
}

.comments-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.comment-skeleton {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}
</style>
