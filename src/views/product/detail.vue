<script setup>
import { ShoppingCart } from '@element-plus/icons-vue'
import { ElButton, ElCarousel, ElCarouselItem, ElImage, ElMessage, ElSkeleton, ElTabPane, ElTabs } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import SkuSelector from '../../components/SkuSelector.vue'
import { useCartStore } from '../../stores/cart'
import { useGoodsStore } from '../../stores/goods'
import { useShopStore } from '../../stores/shop'
import { debounce } from 'lodash-es'

// 路由
const route = useRoute()
const router = useRouter()
const goodsId = parseInt(route.params.id)

// 商品状态管理
const goodsStore = useGoodsStore()
const cartStore = useCartStore()
const shopStore = useShopStore()

// 状态
const loading = ref(true)
const selectedSkuId = ref(null)
const quantity = ref(1)
const activeTab = ref('detail')
const shopInfo = ref(null)

// 在detail.vue中修改为使用计算属性而不是ref
const goods = computed(() => goodsStore.currentGoods)

// 当前选中的SKU
const currentSku = computed(() => {
  if (!selectedSkuId.value || !goods.value.skus) return null
  return goods.value.skus.find(sku => sku.id === selectedSkuId.value)
})

// 计算商品原价
const formatOriginalPrice = computed(() => {
  if (!goods.value.originalPrice) return null
  return (goods.value.originalPrice / 100).toFixed(2)
})

// 计算商品当前价格
const formatCurrentPrice = computed(() => {
  if (currentSku.value) {
    return (currentSku.value.price / 100).toFixed(2)
  }
  if (goods.value.price) {
    return (goods.value.price / 100).toFixed(2)
  }
  return '0.00'
})

/**
 * 加载商品详情
 */
const loadGoodsDetail = async () => {
  loading.value = true
  try {
    await goodsStore.fetchGoodsDetail(goodsId)
    goods.value = goodsStore.currentGoods
    console.log('商品详情:', goods.value)
  } catch (error) {
    console.error('加载商品详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 防抖处理的加入购物车函数
const debouncedAddToCart = debounce(async () => {
  // 1. 参数验证：确认已选择规格
  if (!selectedSkuId.value && goods.value.skus && goods.value.skus.length > 0) {
    ElMessage({
      message: '请选择商品规格',
      type: 'warning'
    })
    return false
  }

  // 2. 检查库存
  const stockToCheck = currentSku.value ? currentSku.value.stock : goods.value.stock
  if (stockToCheck < quantity.value) {
    ElMessage({
      message: '商品库存不足',
      type: 'warning'
    })
    return false
  }

  try {
    // 4. 创建购物车项对象，匹配后端的CartItemDTO结构
    const cartItem = {
      skuId: selectedSkuId.value || null, // 规格ID，如果没有则为null
      skuName: currentSku.value ? currentSku.value.name : null,
      price: currentSku.value ? currentSku.value.price : goods.value.price,
      count: quantity.value, // 商品数量
      checked: true, // 默认选中

      // 商品
      goodsId: goods.value.id,  // 商品ID
      goodsName: goods.value.name,
      goodsImages: goods.value.images || [],

      // 店铺
      shopId: goods.value.shopId,
      shopName: shopInfo.value?.name || `店铺${goods.value.shopId}`,
      shopImage: shopInfo.value?.images || [],
    }

    // 5. 调用购物车store的addItemToCart方法
    const res = await cartStore.addItemToCart(cartItem)

    if (!res || !res.success) {
      return false
    }

    return true
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败，请重试')
    return false
  }
}, 100)

// 包装函数，调用防抖函数
const addToCart = async () => {
  return await debouncedAddToCart()
}

/**
 * 立即购买
 */
const buyNow = async () => {
  // 先添加到购物车
  const success = await addToCart()

  // 如果添加成功，跳转到购物车页面
  if (success) {
    router.push('/cart')
  }
}

/**
 * SKU选择处理
 */
const handleSkuSelected = (skuId) => {
  selectedSkuId.value = skuId
}

// 防抖处理的数量变更函数
const handleQuantityChange = debounce((value) => {
  quantity.value = value
}, 100)

// 组件挂载时加载数据
onMounted(async () => {
  await loadGoodsDetail()

  // 如果有商铺ID，尝试获取商铺信息
  if (goods.value && goods.value.shopId) {
    try {
      await shopStore.fetchShopDetail(goods.value.shopId)
      shopInfo.value = shopStore.currentShop
    } catch (error) {
      console.error('获取商铺信息失败:', error)
    }
  }
})
</script>

<template>
  <AppLayout>
    <div class="goods-detail-container">
      <!-- 在商品详情顶部添加 -->
      <div class="page-header">
        <el-button type="text" icon="ArrowLeft" @click="$router.go(-1)">返回</el-button>
      </div>

      <!-- 加载骨架屏 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-content">
            <div class="skeleton-header">
              <el-skeleton-item variant="image" style="width: 400px; height: 400px" />
              <div style="margin-left: 20px; flex: 1;">
                <el-skeleton-item variant="h1" style="width: 70%; height: 30px; margin-bottom: 20px;" />
                <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 50%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 20px;" />
                <el-skeleton-item variant="text" style="width: 100%; height: 100px;" />
                <el-skeleton-item variant="text" style="width: 80%; margin-top: 20px;" />
              </div>
            </div>
            <div class="skeleton-tabs" style="margin-top: 30px;">
              <el-skeleton-item variant="text" style="width: 100%; height: 50px;" />
            </div>
            <div class="skeleton-content" style="margin-top: 20px;">
              <el-skeleton :rows="6" />
            </div>
          </div>
        </template>

        <!-- 实际内容 -->
        <template #default>
          <div v-if="goods.id" class="goods-detail">
            <div class="goods-header">
              <!-- 商品图片 -->
              <div class="goods-image">
                <el-carousel height="400px" indicator-position="outside">
                  <el-carousel-item>
                    <el-image :src="goods.images" fit="cover" :preview-src-list="[goods.images]" />
                  </el-carousel-item>
                </el-carousel>
              </div>

              <!-- 商品信息 -->
              <div class="goods-info">
                <h1 class="goods-name">{{ goods.name }}</h1>

                <div class="goods-price">
                  <span class="current-price">¥{{ formatCurrentPrice }}</span>
                  <span v-if="formatOriginalPrice" class="original-price">¥{{ formatOriginalPrice }}</span>
                </div>

                <div class="goods-stats">
                  <span class="goods-sold">已售{{ goods.sold }}件</span>
                  <span class="goods-stock">库存{{ goods.stock }}件</span>
                </div>

                <!-- SKU选择 -->
                <div v-if="goods.skus && goods.skus.length > 0" class="sku-wrapper">
                  <SkuSelector :skus="goods.skus" v-model:selected="selectedSkuId" @update:selected="handleSkuSelected"
                    @quantity-change="handleQuantityChange" />
                </div>

                <!-- 按钮区域 -->
                <div class="goods-actions">
                  <el-button type="primary" :icon="ShoppingCart" @click="addToCart">
                    加入购物车
                  </el-button>
                  <el-button type="danger" @click="buyNow">
                    立即购买
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 商品详情选项卡 -->
            <el-tabs v-model="activeTab" class="goods-tabs">
              <el-tab-pane label="商品详情" name="detail">
                <div class="goods-detail-content">
                  <h3>商品描述</h3>
                  <p>{{ goods.description }}</p>

                  <!-- 这里可以放图文详情 -->
                  <div class="detail-images">
                    <el-image :src="goods.images" fit="cover" />
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="商品评价" name="comments">
                <div class="goods-comments">
                  <p>评价功能正在开发中...</p>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div v-else class="goods-not-found">
            <h2>商品不存在或已下架</h2>
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
.goods-detail-container {
  padding: 20px;
}

.goods-header {
  display: flex;
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.goods-image {
  width: 400px;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 24px;
  margin-bottom: 20px;
}

.goods-price {
  margin-bottom: 15px;
}

.current-price {
  font-size: 28px;
  color: #f60;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.goods-stats {
  display: flex;
  margin-bottom: 20px;
}

.goods-sold,
.goods-stock {
  margin-right: 20px;
  color: #666;
}

.sku-wrapper {
  margin-bottom: 20px;
}

.goods-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.goods-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.goods-detail-content {
  padding: 10px 0;
}

.goods-detail-content h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

.goods-detail-content p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 20px;
}

.detail-images {
  margin-top: 20px;
}

.goods-not-found {
  text-align: center;
  padding: 50px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .goods-header {
    flex-direction: column;
  }

  .goods-image {
    width: 100%;
  }

  .goods-info {
    padding: 15px;
  }
}

/* 添加样式 */
.page-header {
  margin-bottom: 15px;
}
</style>
