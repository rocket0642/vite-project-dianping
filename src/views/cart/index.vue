<script setup>
import { Delete } from '@element-plus/icons-vue'
import { ElButton, ElCheckbox, ElEmpty, ElInputNumber, ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'

// 路由实例
const router = useRouter()

// 状态管理
const cartStore = useCartStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const shopCheckedMap = ref({}) // 存储每个店铺的选中状态

// 计算分组后的购物车商品
const groupedItems = computed(() => {
  const groups = {}
  
  cartStore.cartItems.forEach(item => {
    if (!groups[item.shopId]) {
      groups[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName || `店铺${item.shopId}`,
        items: [],
        checked: false
      }
    }
    
    groups[item.shopId].items.push(item)
  })
  
  // 计算每个店铺是否选中
  Object.keys(groups).forEach(shopId => {
    const allChecked = groups[shopId].items.length > 0 && 
                       groups[shopId].items.every(item => item.checked)
    groups[shopId].checked = allChecked
  })
  
  return Object.values(groups)
})

// 选中的商品数量
const checkedCount = computed(() => cartStore.checkedCount)

// 总价
const totalPrice = computed(() => {
  return (cartStore.totalPrice / 100).toFixed(2)
})

// 是否所有商品都已选中
const isAllChecked = computed(() => cartStore.isAllChecked)

// 购物车是否为空
const isEmpty = computed(() => cartStore.cartItems.length === 0)

// 监听店铺选中状态变化
watch(shopCheckedMap, (newVal) => {
  // 更新店铺下所有商品的选中状态
  Object.keys(newVal).forEach(shopId => {
    toggleShopItems(parseInt(shopId), newVal[shopId])
  })
}, { deep: true })

/**
 * 更新商品数量
 */
const updateCount = async (index, count) => {
  await cartStore.updateItemCount(index, count)
}

/**
 * 删除购物车商品
 */
const removeItem = (index) => {
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
      cartStore.removeFromCart(index)
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
  cartStore.toggleShopItems(shopId, checked)
}

/**
 * 切换全选状态
 */
const toggleAllChecked = (checked) => {
  cartStore.toggleAllCheck(checked)
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
      cartStore.removeCheckedItems()
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
      cartStore.clearCart()
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
</script>

<template>
  <AppLayout>
    <div class="cart-container">
      <div class="cart-header">
        <el-button type="text" icon="ArrowLeft" @click="$router.go(-1)">返回</el-button>
        <h2 class="cart-title">我的购物车</h2>
        <div class="cart-actions">
          <el-button 
            type="danger" 
            plain 
            size="small" 
            :icon="Delete" 
            @click="removeChecked"
          >
            删除选中
          </el-button>
          <el-button 
            type="info" 
            plain 
            size="small"
            @click="clearCart"
          >
            清空购物车
          </el-button>
        </div>
      </div>
      
      <!-- 空购物车提示 -->
      <el-empty 
        v-if="isEmpty" 
        description="购物车还是空的"
      >
        <el-button type="primary" @click="continueShopping">
          去购物
        </el-button>
      </el-empty>
      
      <!-- 购物车内容 -->
      <div v-else class="cart-content">
        <!-- 按商铺分组显示 -->
        <div 
          v-for="(group, groupIndex) in groupedItems" 
          :key="group.shopId" 
          class="shop-group"
        >
          <!-- 商铺标题和选择框 -->
          <div class="shop-header">
            <div class="shop-title">
              <el-checkbox 
                v-model="group.checked"
                @change="(val) => toggleShopItems(group.shopId, val)"
              />
              <div class="shop-name" @click="goToShop(group.shopId)">
                {{ group.shopName }}
              </div>
            </div>
          </div>
          
          <!-- 商铺商品列表 -->
          <div class="shop-items">
            <div 
              v-for="(item, itemIndex) in group.items" 
              :key="`${item.id}-${item.skuId || 0}`"
              class="cart-item"
              :class="{ 'item-checked': item.checked }"
            >
              <!-- 商品图片 -->
              <div class="item-image" @click="goToGoods(item.id)">
                <img :src="item.images" :alt="item.name">
              </div>
              
              <!-- 商品信息 -->
              <div class="item-info">
                <div class="item-name" @click="goToGoods(item.id)">
                  {{ item.name }}
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
                <el-input-number 
                  :model-value="item.count" 
                  :min="1" 
                  :max="99"
                  size="small"
                  @change="(val) => updateCount(cartStore.cartItems.indexOf(item), val)"
                />
              </div>
              
              <!-- 商品小计 -->
              <div class="item-subtotal">
                ¥{{ ((item.price * item.count) / 100).toFixed(2) }}
              </div>
              
              <!-- 操作 -->
              <div class="item-actions">
                <el-button 
                  type="danger" 
                  plain 
                  circle 
                  size="small" 
                  :icon="Delete"
                  @click="removeItem(cartStore.cartItems.indexOf(item))"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 结算栏 -->
      <div class="cart-footer">
        <div class="select-all">
          <el-checkbox 
            v-model="isAllChecked"
            @change="toggleAllChecked"
          >
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
          <el-button 
            type="danger" 
            size="large" 
            :disabled="checkedCount === 0"
            @click="checkout"
          >
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.cart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cart-header h2 {
  margin: 0;
  flex: 1;
  text-align: center;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.shop-group {
  margin-bottom: 30px;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f8f8;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
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
}

.item-name {
  font-size: 16px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: color 0.3s;
}

.item-name:hover {
  color: #409EFF;
}

.item-sku {
  font-size: 14px;
  color: #999;
  margin-bottom: 6px;
}

.item-price {
  font-size: 16px;
  color: #f60;
}

.item-quantity {
  margin-right: 30px;
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

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 6px;
  margin-top: 20px;
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
  font-size: 20px;
  font-weight: bold;
  color: #f60;
}

.total-count {
  font-size: 14px;
  color: #666;
}

.checkout-btn .el-button {
  padding: 12px 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-info {
    width: calc(100% - 120px);
    margin-bottom: 10px;
  }
  
  .item-quantity, .item-subtotal {
    margin-top: 10px;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .select-all {
    width: 100%;
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
  }
}

.cart-title {
  flex: 1;
  text-align: center;
  margin: 0;
}
</style>
