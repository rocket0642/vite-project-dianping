<script setup>
import { Delete } from '@element-plus/icons-vue'
import { ElButton, ElCheckbox, ElEmpty, ElInputNumber, ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'
import { debounce } from 'lodash-es'

// 路由实例
const router = useRouter()

// 状态管理
const cartStore = useCartStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const shopCheckedMap = ref({}) // 存储每个店铺的选中状态

// 在组件挂载时获取购物车数据并初始化店铺选择状态
onMounted(async () => {
  // 加载购物车数据
  await cartStore.fetchUserCart()

  // 初始化店铺选中状态
  initShopCheckedMap()
})

// 初始化店铺选中状态
const initShopCheckedMap = () => {
  const map = {}
  cartStore.shopCarts.forEach(shop => {
    // 店铺选中状态 = 该店铺下所有商品都被选中
    map[shop.shopId] = shop.items.length > 0 && shop.items.every(item => item.checked)
  })
  shopCheckedMap.value = map
}

// 监听购物车数据变化，更新选中状态
watch(() => cartStore.shopCarts, () => {
  initShopCheckedMap()
}, { deep: true })

// 选中的商品数量
const checkedCount = computed(() => cartStore.selectedCount)

// 总价
const totalPrice = computed(() => {
  return (cartStore.selectedAmount / 100).toFixed(2)
})

// 是否所有商品都已选中
const isAllChecked = computed(() => {
  return cartStore.totalCount > 0 && cartStore.selectedCount === cartStore.totalCount
})

// 购物车是否为空
const isEmpty = computed(() => cartStore.shopCarts.length === 0)

// 是否未登录
const isGuest = computed(() => !userStore.isLogin)

// 防抖处理购物车商品选中状态变更
const checkItemWithDebounce = debounce((shopId, item, checked) => {
  cartStore.checkItem({
    shopId: shopId,
    goodsId: item.goodsId,
    skuId: item.skuId,
    checked: checked
  }).then(() => {
    // 成功后更新shopCheckedMap
    updateShopCheckedState(shopId)
  })
}, 200)

// 更新指定店铺的选中状态
const updateShopCheckedState = (shopId) => {
  const shop = cartStore.shopCarts.find(s => s.shopId === shopId)
  if (shop) {
    shopCheckedMap.value[shopId] = shop.items.length > 0 &&
      shop.items.every(item => item.checked)
  }
}

// 防抖处理数量更新
const updateCountWithDebounce = debounce(async (shopId, item, count) => {
  try {
    loading.value = true
    const res = await cartStore.updateItemCount({
      shopId: shopId,
      goodsId: item.goodsId,
      skuId: item.skuId || null,
      count: count
    })

    if (!res.success && res.errorMsg) {
      ElMessage.error(res.errorMsg)
    }
  } catch (error) {
    ElMessage.error('更新数量失败，请重试')
  } finally {
    loading.value = false
  }
}, 200)

// 替换原来的updateCount函数
const updateCount = (shopId, item, count) => {
  updateCountWithDebounce(shopId, item, count)
}

/**
 * 删除购物车商品
 */
const removeItem = (shopId, item) => {
  ElMessageBox.confirm(
    '确定要从购物车中删除此商品吗？',
    '删除提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      cartStore.removeItem({
        shopId: shopId,
        goodsId: item.goodsId,
        skuId: item.skuId
      })
      ElMessage({
        type: 'success',
        message: '商品已从购物车中删除'
      })
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 切换店铺选中状态（同时切换该店铺下所有商品的选中状态）
 */
const toggleShopItems = (shopId, checked) => {
  // 直接调用store方法修改所有商品状态
  cartStore.checkShopCart({
    shopId: shopId,
    checked: checked
  }).then(() => {
    // 更新店铺选中状态映射
    shopCheckedMap.value[shopId] = checked
  })
}

/**
 * 切换全选状态
 */
const toggleAllChecked = (checked) => {
  cartStore.checkAll(checked).then(() => {
    // 更新所有店铺的选中状态
    const newMap = { ...shopCheckedMap.value }
    cartStore.shopCarts.forEach(shop => {
      newMap[shop.shopId] = checked
    })
    shopCheckedMap.value = newMap
  })
}

/**
 * 删除选中的商品
 */
const removeChecked = () => {
  if (checkedCount.value === 0) {
    ElMessage({
      type: 'warning',
      message: '请先选择要删除的商品'
    })
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的${checkedCount.value}件商品吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      cartStore.removeChecked()
      ElMessage({
        type: 'success',
        message: '选中的商品已删除'
      })
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 清空购物车
 */
const clearCart = () => {
  if (isEmpty.value) {
    ElMessage({
      type: 'warning',
      message: '购物车已经是空的'
    })
    return
  }

  ElMessageBox.confirm(
    '确定要清空购物车吗？',
    '清空购物车',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      cartStore.clearUserCart()
      ElMessage({
        type: 'success',
        message: '购物车已清空'
      })
    })
    .catch(() => {
      // 用户取消操作
    })
}

/**
 * 跳转到商品详情页
 */
const goToGoods = (goodsId) => {
  router.push(`/product/${goodsId}`)
}

/**
 * 跳转到商铺详情页
 */
const goToShop = (shopId) => {
  router.push(`/shop/${shopId}`)
}

/**
 * 结算
 */
const checkout = () => {
  if (!userStore.isLogin) {
    ElMessage({
      type: 'warning',
      message: '请先登录'
    })
    router.push('/login?redirect=/cart')
    return
  }

  if (checkedCount.value === 0) {
    ElMessage({
      type: 'warning',
      message: '请选择要结算的商品'
    })
    return
  }

  // 跳转到创建订单页面
  router.push('/order/create')
}

/**
 * 返回继续购物
 */
const continueShopping = () => {
  router.push('/')
}

// 检查商品选择状态变化
const checkItem = (shopId, item, checked) => {
  // 使用防抖处理
  checkItemWithDebounce(shopId, item, checked)
}

// 添加刷新购物车方法
const refreshCart = async () => {
  try {
    await cartStore.fetchUserCart()
    initShopCheckedMap()
  } catch (error) {
    console.error('刷新购物车失败:', error)
  }
}
</script>

<template>
  <AppLayout>
    <!-- 固定顶部标题栏 -->
    <div class="cart-header-fixed">
      <div class="cart-header-content">
        <el-button type="text" icon="ArrowLeft" @click="router.back()">返回</el-button>
        <h2 class="cart-title">我的购物车</h2>
        <div class="cart-actions">
          <el-button type="primary" plain size="small" icon="Refresh" @click="refreshCart">
            刷新
          </el-button>
          <el-button type="danger" plain size="small" :icon="Delete" @click="removeChecked">
            删除选中
          </el-button>
          <el-button type="info" plain size="small" @click="clearCart">
            清空购物车
          </el-button>
        </div>
      </div>
    </div>

    <!-- 为固定标题栏预留空间 -->
    <div class="header-placeholder"></div>

    <div class="cart-container">
      <!-- 未登录提示 -->
      <div v-if="isGuest" class="guest-alert">
        <el-alert title="您当前未登录，购物车数据将保存在本地，登录后可以同步到您的账户" type="info" description="注意：本地购物车数据仅在当前浏览器保存，清除浏览器缓存可能导致数据丢失"
          show-icon :closable="false" />
      </div>

      <!-- 空购物车提示 -->
      <el-empty v-if="isEmpty" description="购物车还是空的" class="empty-cart">
        <el-button type="primary" @click="continueShopping">
          去购物
        </el-button>
      </el-empty>

      <!-- 购物车内容 -->
      <div v-else class="cart-content">
        <!-- 按商铺分组显示 -->
        <div v-for="(group, groupIndex) in cartStore.shopCarts" :key="group.shopId" class="shop-group">
          <!-- 商铺标题和选择框 -->
          <div class="shop-header">
            <div class="shop-title">
              <el-checkbox :model-value="shopCheckedMap[group.shopId]"
                :indeterminate="group.items.some(item => item.checked) && !group.items.every(item => item.checked)"
                @change="toggleShopItems(group.shopId, $event)" class="shop-checkbox" />
              <div class="shop-name" @click="goToShop(group.shopId)">
                <i class="el-icon-shop"></i> {{ group.shopName }}
              </div>
            </div>
          </div>

          <!-- 商铺商品列表 -->
          <div class="shop-items">
            <div v-for="(item, itemIndex) in group.items" :key="`${item.goodsId}-${item.skuId || 0}`" class="cart-item"
              :class="{ 'item-checked': item.checked }">
              <!-- 商品选择框 -->
              <el-checkbox :model-value="item.checked" @change="(val) => checkItem(group.shopId, item, val)"
                class="item-checkbox" />

              <!-- 商品图片 -->
              <div class="item-image" @click="goToGoods(item.goodsId)">
                <img :src="item.goodsImages" :alt="item.goodsName">
              </div>

              <!-- 商品信息 -->
              <div class="item-info">
                <div class="item-name" @click="goToGoods(item.goodsId)">
                  {{ item.goodsName }}
                </div>
                <div v-if="item.skuName" class="item-sku">
                  规格：{{ item.skuName }}
                </div>
                <div class="item-price">
                  ¥{{ (item.price / 100).toFixed(2) }}
                </div>
              </div>

              <!-- 商品数量 -->
              <div class="item-quantity">
                <el-input-number :model-value="item.count" :min="1" :max="99" size="small"
                  @change="(val) => updateCount(group.shopId, item, val)" />
              </div>

              <!-- 商品小计 -->
              <div class="item-subtotal">
                ¥{{ ((item.price * item.count) / 100).toFixed(2) }}
              </div>

              <!-- 操作 -->
              <div class="item-actions">
                <el-button type="danger" plain circle size="small" :icon="Delete"
                  @click="removeItem(group.shopId, item)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 为底部结算栏预留空间 -->
    <div class="footer-placeholder"></div>

    <!-- 固定底部结算栏 -->
    <div class="cart-footer-fixed">
      <div class="cart-footer-content">
        <div class="select-all">
          <el-checkbox :model-value="isAllChecked" :indeterminate="cartStore.selectedCount > 0 && !isAllChecked"
            @change="toggleAllChecked">
            全选
          </el-checkbox>
        </div>

        <div class="cart-total">
          <div class="total-price">
            合计：<span class="price">¥{{ totalPrice }}</span>
          </div>
          <div class="total-count">
            已选择{{ checkedCount }}件商品
          </div>
        </div>

        <div class="checkout-btn">
          <el-button type="danger" size="large" :disabled="checkedCount === 0" @click="checkout">
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.cart-container {
  padding: 10px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 固定顶部标题栏 */
.cart-header-fixed {
  position: fixed;
  top: 60px;
  /* 假设导航栏高度为60px，根据实际情况调整 */
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.cart-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 为固定顶部预留空间 */
.header-placeholder {
  height: 60px;
}

/* 固定底部结算栏 */
.cart-footer-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.cart-footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 为固定底部预留空间 */
.footer-placeholder {
  height: 70px;
}

.cart-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 18px;
  color: #333;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.shop-group {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f8f8;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.shop-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-name {
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s;
  font-size: 15px;
}

.shop-name:hover {
  color: #409EFF;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  transition: background-color 0.3s;
}

.cart-item:hover {
  background-color: #fafafa;
}

.item-checked {
  background-color: #f0f9ff;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-image:hover img {
  transform: scale(1.05);
}

.item-info {
  flex: 1;
  margin-right: 15px;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.item-name:hover {
  color: #409EFF;
}

.item-sku {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.item-price {
  font-size: 16px;
  color: #f60;
  font-weight: 500;
}

.item-quantity {
  margin: 0 30px;
}

.item-subtotal {
  font-size: 16px;
  font-weight: bold;
  color: #f60;
  width: 120px;
  text-align: center;
}

.item-actions {
  margin-left: 15px;
}

.select-all {
  margin-left: 5px;
}

.cart-total {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-price {
  font-size: 16px;
}

.price {
  font-size: 22px;
  font-weight: bold;
  color: #f60;
}

.total-count {
  font-size: 14px;
  color: #666;
}

.checkout-btn .el-button {
  padding: 12px 30px;
  min-width: 120px;
  font-size: 16px;
}

.checkout-btn .el-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.empty-cart {
  padding: 50px 0;
}

.guest-alert {
  margin-bottom: 20px;
}

.cart-content {
  margin-top: 20px;
}

.shop-checkbox {
  margin-right: 12px;
}

.item-checkbox {
  margin-right: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-header-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
    gap: 10px;
  }

  .cart-header-fixed {
    padding: 0 10px;
  }

  .header-placeholder {
    height: 110px;
  }

  .cart-actions {
    width: 100%;
    justify-content: center;
  }

  .cart-item {
    flex-wrap: wrap;
    padding: 10px;
  }

  .item-image {
    width: 70px;
    height: 70px;
  }

  .item-info {
    width: calc(100% - 100px);
    margin-bottom: 10px;
  }

  .item-quantity,
  .item-subtotal {
    margin: 10px 10px 10px 0;
  }

  .cart-footer-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
    gap: 10px;
  }

  .footer-placeholder {
    height: 130px;
  }

  .select-all {
    width: 100%;
    margin-left: 0;
  }

  .cart-total {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .checkout-btn {
    width: 100%;
  }

  .checkout-btn .el-button {
    width: 100%;
    margin-top: 5px;
  }
}
</style>
