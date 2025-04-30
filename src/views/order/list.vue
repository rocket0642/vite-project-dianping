<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 路由和存储
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const activeTab = ref('0')
const currentPage = ref(1)
const countdowns = ref({}) // 用于存储倒计时显示值
const timers = ref({})

// 计算属性
const orders = computed(() => orderStore.orderList)
const total = computed(() => orderStore.orderTotal)

/**
 * 加载订单列表
 */
const loadOrders = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/list')
    return
  }
  
  loading.value = true
  try {
    await orderStore.fetchOrderList({
      status: activeTab.value !== '0' ? activeTab.value : undefined,
      current: currentPage.value
    })
    
    // 为未支付订单启动倒计时
    startCountdowns()
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 启动所有倒计时
 */
const startCountdowns = () => {
  // 停止所有现有定时器
  clearAllTimers()
  
  // 为每个未支付订单启动倒计时
  orders.value.forEach(order => {
    if (order.status === 1) { // 未支付状态
      // 生成30分钟倒计时（从创建时间计算）
      initOrderCountdown(order)
    }
  })
}

/**
 * 初始化订单倒计时
 */
const initOrderCountdown = (order) => {
  const orderId = order.id
  
  // 将创建时间转为时间戳
  const createTime = new Date(order.createTime.replace(/-/g, '/')).getTime()
  const expireTime = createTime + 30 * 60 * 1000 // 30分钟后过期
  const now = Date.now()
  
  // 计算剩余时间（毫秒）
  let remainingTime = expireTime - now
  
  // 如果已经过期，取消订单
  if (remainingTime <= 0) {
    cancelExpiredOrder(orderId)
    return
  }
  
  // 初始化倒计时显示
  updateCountdownDisplay(orderId, remainingTime)
  
  // 设置定时器，每秒更新倒计时
  timers.value[orderId] = setInterval(() => {
    remainingTime -= 1000
    
    if (remainingTime <= 0) {
      clearInterval(timers.value[orderId])
      cancelExpiredOrder(orderId)
    } else {
      updateCountdownDisplay(orderId, remainingTime)
    }
  }, 1000)
}

/**
 * 更新倒计时显示
 */
const updateCountdownDisplay = (orderId, milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  countdowns.value[orderId] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * 取消过期订单
 */
const cancelExpiredOrder = async (orderId) => {
  try {
    await orderStore.cancelUserOrder(orderId, "超时自动取消")
    ElMessage.info(`订单 ${orderId} 已超时自动取消`)
    loadOrders() // 刷新订单列表
  } catch (error) {
    console.error('取消过期订单失败:', error)
  }
}

/**
 * 清除所有定时器
 */
const clearAllTimers = () => {
  Object.keys(timers.value).forEach(key => {
    clearInterval(timers.value[key])
  })
  timers.value = {}
}

/**
 * 切换标签页
 */
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  loadOrders()
}

/**
 * 分页变化
 */
const handlePageChange = (page) => {
  currentPage.value = page
  loadOrders()
}

/**
 * 跳转到商品详情
 */
const goToGoodsDetail = (goodsId) => {
  router.push(`/product/${goodsId}`)
}

/**
 * 跳转到店铺详情
 */
const goToShopDetail = (shopId) => {
  router.push(`/shop/${shopId}`)
}

/**
 * 查看订单详情
 */
const viewOrderDetail = (orderId) => {
  router.push(`/order/detail/${orderId}`)
}

/**
 * 去支付
 */
const goToPay = (orderId) => {
  if (!orderId) {
    ElMessage.error('订单ID无效')
    return
  }
  // 确保路由参数是整数
  router.push(`/order/pay/${parseInt(orderId)}`)
}

/**
 * 取消订单
 */
const cancelOrder = async (orderId) => {
  try {
    const res = await orderStore.cancelUserOrder(orderId, "用户取消")
    if (res.success) {
      ElMessage.success('订单已取消')
      // 清除倒计时
      if (timers.value[orderId]) {
        clearInterval(timers.value[orderId])
        delete timers.value[orderId]
      }
      loadOrders()
    } else {
      ElMessage.error(res.errorMsg || '取消订单失败')
    }
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败，请稍后重试')
  }
}

/**
 * 确认收货
 */
const confirmOrder = async (orderId) => {
  try {
    const res = await orderStore.confirmUserOrder(orderId)
    if (res.success) {
      ElMessage.success('已确认收货')
      loadOrders()
    } else {
      ElMessage.error(res.errorMsg || '确认收货失败')
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败，请稍后重试')
  }
}

/**
 * 再次购买
 */
const buyAgain = (order) => {
  router.push(`/product/${order.goodsId}`)
}

/**
 * 格式化价格
 */
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

/**
 * 获取状态文本
 */
const getStatusText = (status) => {
  switch (status) {
    case 1: return '待付款'
    case 2: return '已支付'
    case 3: return '已取消'
    case 4: return '已完成'
    default: return '未知状态'
  }
}

// 初始化
onMounted(() => {
  loadOrders()
})

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  clearAllTimers()
})
</script>

<template>
  <AppLayout>
    <div class="order-list-container" v-loading="loading">
      <div class="order-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === '0' }"
          @click="handleTabChange('0')"
        >
          全部订单
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === '1' }"
          @click="handleTabChange('1')"
        >
          待付款
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === '2' }"
          @click="handleTabChange('2')"
        >
          已支付
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === '3' }"
          @click="handleTabChange('3')"
        >
          已取消
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === '4' }"
          @click="handleTabChange('4')"
        >
          已完成
        </div>
      </div>
      
      <div v-if="orders.length === 0" class="no-orders">
        暂无订单
      </div>
      
      <div v-else>
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-basic-info">
              <span class="order-id">订单号: {{ order.id }}</span>
              <span class="order-time">下单时间: {{ order.createTime }}</span>
            </div>
            <div class="order-status">
              <span :class="['status-tag', `status-${order.status}`]">
                {{ getStatusText(order.status) }}
              </span>
              <!-- 显示倒计时 -->
              <span v-if="order.status === 1" class="countdown-tag">
                剩余: {{ countdowns[order.id] || '30:00' }}
              </span>
            </div>
          </div>
          
          <div class="order-content">
            <div class="order-shop-info">
              <span class="shop-name" @click="goToShopDetail(order.shopId)">
                {{ order.shopName }}
              </span>
            </div>
            
            <div class="order-product">
              <div class="product-info">
                <div class="product-name" @click="goToGoodsDetail(order.goodsId)">
                  {{ order.goodsName }}
                </div>
                <div class="product-quantity">x{{ order.count }}</div>
              </div>
              <div class="product-price">¥{{ formatPrice(order.amount) }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              共{{ order.count }}件商品，总计：¥{{ formatPrice(order.amount) }}
            </div>
            
            <div class="order-actions">
              <!-- 待付款订单 -->
              <template v-if="order.status === 1">
                <button class="action-btn primary" @click="goToPay(order.id)">去支付</button>
                <button class="action-btn default" @click="cancelOrder(order.id)">取消订单</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已支付订单 -->
              <template v-else-if="order.status === 2">
                <button class="action-btn primary" @click="confirmOrder(order.id)">确认收货</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已取消订单 -->
              <template v-else-if="order.status === 3">
                <button class="action-btn primary" @click="buyAgain(order)">再次购买</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已完成订单 -->
              <template v-else-if="order.status === 4">
                <button class="action-btn primary" @click="buyAgain(order)">再次购买</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-list-container {
  width: 80%;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 22px;
  color: #333;
}

.order-tabs {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #409eff;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409eff;
}

.loading-container {
  text-align: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ebeef5;
}

.order-basic-info {
  display: flex;
  gap: 15px;
}

.order-id, .order-time {
  color: #606266;
  margin-right: 20px;
  font-size: 14px;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.status-1 {
  background-color: #e6a23c;
  color: white;
}

.status-2 {
  background-color: #409eff;
  color: white;
}

.status-3 {
  background-color: #909399;
  color: white;
}

.status-4 {
  background-color: #67c23a;
  color: white;
}

.countdown-tag {
  color: #f56c6c;
  font-weight: bold;
  font-size: 14px;
  margin-left: 10px;
}

.order-content {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-shop-info {
  margin-bottom: 10px;
}

.shop-name {
  font-weight: bold;
  cursor: pointer;
  color: #303133;
}

.shop-name:hover {
  color: #409eff;
  text-decoration: underline;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-name {
  margin-right: 15px;
  cursor: pointer;
  color: #303133;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name:hover {
  color: #409eff;
  text-decoration: underline;
}

.product-quantity {
  color: #606266;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.order-total {
  color: #606266;
}

.price {
  color: #F56C6C;
  font-weight: bold;
  font-size: 16px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn.primary {
  background-color: #409eff;
  color: white;
}

.action-btn.primary:hover {
  background-color: #66b1ff;
}

.action-btn.default {
  background-color: #f56c6c;
  color: white;
}

.action-btn.default:hover {
  background-color: #f78989;
}

.action-btn.info {
  background-color: #909399;
  color: white;
}

.action-btn.info:hover {
  background-color: #a6a9ad;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .order-list-container {
    width: 95%;
    padding: 10px;
  }
  
  .order-header, .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-basic-info {
    margin-bottom: 10px;
  }
  
  .order-status {
    width: 100%;
    justify-content: space-between;
  }
  
  .order-actions {
    width: 100%;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  
  .product-name {
    max-width: 150px;
  }
}
</style>
