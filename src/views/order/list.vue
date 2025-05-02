<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElDialog, ElRadio, ElButton, ElEmpty, ElPagination } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { getUserAddresses } from '../../api/address'

// 路由和存储
const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const activeTab = ref('all')
const pageSize = ref(3) // 每页显示3条记录
const countdowns = ref({}) // 用于存储倒计时显示值
const timers = ref({})

// 每个状态的分页状态独立存储
const paginationState = ref({
  all: { currentPage: 1, total: 0 },
  paid: { currentPage: 1, total: 0 },
  unpaid: { currentPage: 1, total: 0 },
  canceled: { currentPage: 1, total: 0 },
  unreceived: { currentPage: 1, total: 0 },
  uncommented: { currentPage: 1, total: 0 }
})

// 地址相关
const addressDialogVisible = ref(false)
const addresses = ref([])
const addressesLoading = ref(false)
const selectedAddress = ref(null)
const currentOrderId = ref(null)

// 计算属性
const orders = computed(() => orderStore.orderList)
const currentPage = computed({
  get: () => paginationState.value[activeTab.value].currentPage,
  set: (val) => paginationState.value[activeTab.value].currentPage = val
})
const total = computed(() => paginationState.value[activeTab.value].total)

/**
 * 修复版loadOrders - 完全解决缓存不一致问题
 */
const loadOrders = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/list')
    return
  }
  
  loading.value = true
  try {
    // 将tab值转换为API状态值
    const tabToStatusMap = {
      'all': undefined,
      'paid': [2, 4, 5],  // 包含已支付(2)、待收货(4)和已完成(5)的订单
      'unpaid': 1,
      'canceled': 3,
      'unreceived': 4,
      'uncommented': 5
    };
    
    const statusValue = tabToStatusMap[activeTab.value];
    const params = {
      current: currentPage.value,
      pageSize: pageSize.value
    };
    
    // 如果是多状态（已支付选项卡），使用statuses参数
    if (Array.isArray(statusValue)) {
      params.statuses = statusValue.join(',');
    } 
    // 否则使用单一status参数
    else if (statusValue !== undefined) {
      params.status = statusValue;
    }
    
    // 对于待评价标签，额外添加未评价条件
    if (activeTab.value === 'uncommented') {
      params.uncommented = true;
    }
    
    const result = await orderStore.fetchOrderList(params);
    
    paginationState.value[activeTab.value].total = result.total || 0;
    
    // 为未支付订单启动倒计时
    startCountdowns();
  } catch (error) {
    console.error('加载订单列表失败:', error);
    ElMessage.error('加载订单失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

/**
 * 启动所有倒计时
 */
const startCountdowns = () => {
  clearAllTimers()
  
  orders.value.forEach(order => {
    if (order.status === 1) {
      initOrderCountdown(order)
    }
  })
}

/**
 * 初始化订单倒计时
 */
const initOrderCountdown = (order) => {
  const orderId = order.id
  
  const createTime = new Date(order.createTime.replace(/-/g, '/')).getTime()
  const expireTime = createTime + 30 * 60 * 1000
  const now = Date.now()
  
  let remainingTime = expireTime - now
  
  if (remainingTime <= 0) {
    cancelExpiredOrder(orderId)
    return
  }
  
  updateCountdownDisplay(orderId, remainingTime)
  
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
    loadOrders()
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
  // 不重置页码，直接使用各自的currentPage
  router.push({ query: { status: tabToStatusMap[tab] } })
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
    case 4: return '待收货'
    case 5: return '已完成'
    default: return '未知状态'
  }
}

/**
 * 修复版的评价检查函数 - 只依赖服务器数据
 */
// const checkOrderCommented = async (orderId) => {
//   try {
//     // 直接向服务器查询最新状态
//     const res = await checkOrderComment(orderId);
//     return res.data;
//   } catch (error) {
//     console.error('检查订单评价状态失败:', error);
//     return false;
//   }
// }

/**
 * 修复版的去评价函数
 */
const goToComment = (orderId) => {
  router.push(`/order/comment/${orderId}`)
}

/**
 * 查看物流
 */
const viewLogistics = (orderId) => {
  router.push(`/order/logistics/${orderId}`)
}

/**
 * 打开地址选择对话框
 */
const openAddressDialog = (orderId) => {
  currentOrderId.value = orderId
  loadUserAddresses()
  addressDialogVisible.value = true
}

/**
 * 加载用户地址列表
 */
const loadUserAddresses = async () => {
  addressesLoading.value = true
  try {
    const res = await getUserAddresses()
    addresses.value = res
    
    if (!selectedAddress.value && addresses.value.length > 0) {
      const defaultAddress = addresses.value.find(addr => addr.isDefault)
      selectedAddress.value = defaultAddress || addresses.value[0]
    }
  } catch (error) {
    console.error('加载地址列表失败:', error)
    ElMessage.error('加载地址列表失败，请稍后重试')
  } finally {
    addressesLoading.value = false
  }
}

/**
 * 选择地址
 */
const selectAddress = (address) => {
  selectedAddress.value = address
}

/**
 * 更新订单地址
 */
const updateOrderAddress = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  try {
    const order = orders.value.find(o => o.id === currentOrderId.value)
    if (order) {
      order.addressId = selectedAddress.value.id
      order.addressName = selectedAddress.value.name
      order.addressPhone = selectedAddress.value.phone
      order.addressDetail = selectedAddress.value.address
    }
    
    ElMessage.success('收货地址已更新')
    addressDialogVisible.value = false
  } catch (error) {
    console.error('更新地址失败:', error)
    ElMessage.error('更新地址失败，请稍后重试')
  }
}

// 合并tabToStatusMap定义，避免重复定义
const tabToStatusMap = {
  'all': undefined,
  'paid': [2, 4, 5],
  'unpaid': 1,
  'canceled': 3,
  'unreceived': 4,
  'uncommented': 5
};

// 初始化
onMounted(async () => {
  const status = parseInt(route.query.status) || 0;
  const statusToTabMap = {
    0: 'all',
    2: 'paid',
    1: 'unpaid',
    3: 'canceled',
    4: 'unreceived',
    5: 'uncommented'
  };
  
  activeTab.value = statusToTabMap[status] || 'all';
  await loadOrders();
});

// 监听路由参数变化
watch(
  () => route.query.status,
  (newStatus) => {
    const status = parseInt(newStatus) || 0;
    const statusToTabMap = {
      0: 'all',
      2: 'paid',
      1: 'unpaid',
      3: 'canceled',
      4: 'unreceived',
      5: 'uncommented'
    };
    activeTab.value = statusToTabMap[status] || 'all';
    // 不重置页码
    loadOrders();
  }
);

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  clearAllTimers()
})

/**
 * 获取默认图片
 */
function getDefaultImage(type) {
  if (type === 'shop') {
    return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  } else if (type === 'goods') {
    return 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
  }
  return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
}
</script>

<template>
  <AppLayout>
    <div class="order-list-container" v-loading="loading">
      <div class="list-header">
        <el-button type="text" icon="ArrowLeft" @click="$router.push('/user')">返回个人中心</el-button>
      </div>
      <div class="order-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="handleTabChange('all')"
        >
          全部订单
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'paid' }"
          @click="handleTabChange('paid')"
        >
          已支付
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'unpaid' }"
          @click="handleTabChange('unpaid')"
        >
          待付款
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'canceled' }"
          @click="handleTabChange('canceled')"
        >
          已取消
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'unreceived' }"
          @click="handleTabChange('unreceived')"
        >
          待收货
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'uncommented' }"
          @click="handleTabChange('uncommented')"
        >
          待评价
        </div>
      </div>
      
      <div v-if="orders.length === 0" class="no-orders">
        暂无订单
      </div>
      
      <div v-else class="orders-scroll-container">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="shop-info-header" @click="goToShopDetail(order.shopId)">
              <div class="shop-avatar">
                <img :src="order.shopImage || getDefaultImage('shop')" alt="店铺图片" />
              </div>
              <div class="order-basic-info">
                <span class="shop-name">{{ order.shopName }}</span>
                <div class="order-meta">
                  <span class="order-id">订单号: {{ order.id }}</span>
                  <span class="order-time">下单时间: {{ order.createTime }}</span>
                </div>
              </div>
            </div>
            <div class="order-status">
              <span :class="['status-tag', `status-${order.status}`]">
                {{ getStatusText(order.status) }}
              </span>
              <span v-if="order.status === 1" class="countdown-tag">
                剩余: {{ countdowns[order.id] || '30:00' }}
              </span>
            </div>
          </div>
          
          <div class="order-content">
            <!-- 如果有items数组，则遍历显示所有商品 -->
            <div v-if="order.items && order.items.length" class="order-products">
              <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="order-product">
                <div class="product-image" @click="goToGoodsDetail(item.goodsId)">
                  <img :src="item.goodsImage || getDefaultImage('goods')" alt="商品图片" />
                </div>
                <div class="product-info">
                  <div class="product-name" @click="goToGoodsDetail(item.goodsId)">
                    {{ item.goodsName }}
                  </div>
                  <div class="product-quantity">x{{ item.count }}</div>
                </div>
                <div class="product-price">¥{{ formatPrice(item.price * item.count) }}</div>
              </div>
            </div>
            <!-- 向下兼容，如果没有items数组，则显示单个商品 -->
            <div v-else class="order-product">
              <div class="product-image" @click="goToGoodsDetail(order.goodsId)">
                <img :src="order.goodsImage || getDefaultImage('goods')" alt="商品图片" />
              </div>
              <div class="product-info">
                <div class="product-name" @click="goToGoodsDetail(order.goodsId)">
                  {{ order.goodsName }}
                </div>
                <div class="product-quantity">x{{ order.count }}</div>
              </div>
              <div class="product-price">¥{{ formatPrice(order.amount) }}</div>
            </div>
            
            <!-- 显示收货地址信息 -->
            <div v-if="order.status === 1" class="order-address">
              <div class="address-header">
                <span class="address-title">收货信息：</span>
                <span v-if="order.addressName" class="address-info">
                  {{ order.addressName }} {{ order.addressPhone }} {{ order.addressDetail }}
                </span>
                <span v-else class="address-empty">暂无收货地址</span>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              共{{ order.count }}件商品，总计：<span class="price">¥{{ formatPrice(order.amount) }}</span>
            </div>
            
            <div class="order-actions">
              <!-- 待付款订单 -->
              <template v-if="order.status === 1">
                <button class="action-btn primary" @click="goToPay(order.id)">去支付</button>
                <button class="action-btn secondary" @click="openAddressDialog(order.id)">修改地址</button>
                <button class="action-btn default" @click="cancelOrder(order.id)">取消订单</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已支付订单 -->
              <template v-else-if="order.status === 2">
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已取消订单 -->
              <template v-else-if="order.status === 3">
                <button class="action-btn primary" @click="buyAgain(order)">再次购买</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 待收货订单 -->
              <template v-else-if="order.status === 4">
                <button class="action-btn primary" @click="confirmOrder(order.id)">确认收货</button>
                <button class="action-btn default" @click="viewLogistics(order.id)">查看物流</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 已完成订单 -->
              <template v-else-if="order.status === 5">
                <button 
                  v-if="!order.commented" 
                  class="action-btn primary" 
                  @click="goToComment(order.id)"
                >
                  去评价
                </button>
                <button v-else class="action-btn disabled" disabled>已评价</button>
                <button class="action-btn default" @click="applyRefund(order.id)">申请售后</button>
                <button class="action-btn primary" @click="buyAgain(order)">再次购买</button>
                <button class="action-btn info" @click="viewOrderDetail(order.id)">查看详情</button>
              </template>
            </div>
          </div>
        </div>
        
        <!-- 分页组件 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            background
          />
        </div>
      </div>
      
      <!-- 地址选择对话框 -->
      <el-dialog
        v-model="addressDialogVisible"
        title="选择收货地址"
        width="600px"
      >
        <div class="address-dialog-content" v-loading="addressesLoading">
          <el-empty v-if="addresses.length === 0" description="暂无收货地址" />
          <div 
            v-else
            v-for="address in addresses" 
            :key="address.id" 
            :class="['address-dialog-item', { active: selectedAddress && selectedAddress.id === address.id }]"
            @click="selectAddress(address)"
          >
            <div class="address-info">
              <div class="contact">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
                <span v-if="address.isDefault" class="default-tag">默认</span>
              </div>
              <div class="detail">{{ address.address }}</div>
            </div>
            <div class="address-actions">
              <el-radio 
                v-model="selectedAddress.id" 
                :label="address.id"
                @change="selectAddress(address)"
              >选择</el-radio>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateOrderAddress">确认</el-button>
          </span>
        </template>
      </el-dialog>
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
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.orders-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.orders-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.orders-scroll-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.orders-scroll-container::-webkit-scrollbar-track {
  background-color: #f5f5f5;
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
  flex-shrink: 0;
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

.no-orders {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-size: 16px;
}

.order-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  background-color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ebeef5;
}

.shop-info-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.shop-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: 1px solid #ebeef5;
}

.shop-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-name {
  font-weight: bold;
  color: #333;
  font-size: 16px;
  margin-bottom: 5px;
  display: block;
}

.shop-name:hover {
  color: #409eff;
}

.order-meta {
  display: flex;
  gap: 15px;
}

.order-id, .order-time {
  color: #606266;
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
  color: white;
}

.status-1 { background-color: #e6a23c; }
.status-2 { background-color: #409eff; }
.status-3 { background-color: #909399; }
.status-4 { background-color: #67c23a; }
.status-5 { background-color: #e6a23c; }

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

.order-products {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-product {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.order-product:last-child {
  border-bottom: none;
}

.product-image {
  width: 70px;
  height: 70px;
  margin-right: 15px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  margin-bottom: 8px;
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
  width: 120px;
  text-align: right;
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
  color: white;
}

.action-btn.primary { background-color: #409eff; }
.action-btn.primary:hover { background-color: #66b1ff; }
.action-btn.secondary { background-color: #67c23a; }
.action-btn.secondary:hover { background-color: #85ce61; }
.action-btn.default { background-color: #f56c6c; }
.action-btn.default:hover { background-color: #f78989; }
.action-btn.info { background-color: #909399; }
.action-btn.info:hover { background-color: #a6a9ad; }

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 订单地址样式 */
.order-address {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.address-header {
  display: flex;
  align-items: baseline;
}

.address-title {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.address-info {
  color: #303133;
}

.address-empty {
  color: #909399;
  font-style: italic;
}

.list-header {
  margin-bottom: 15px;
}

/* 添加禁用按钮样式 */
.action-btn.disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
  opacity: 0.7;
}
.action-btn.disabled:hover {
  background-color: #c0c4cc;
}

@media (max-width: 768px) {
  .order-list-container {
    width: 95%;
    padding: 10px;
  }
  
  .order-header {
    flex-direction: column;
  }
  
  .shop-info-header {
    margin-bottom: 10px;
  }
  
  .order-status {
    align-self: flex-end;
  }
  
  .order-actions {
    flex-wrap: wrap;
  }
  
  .product-name {
    max-width: 150px;
  }
}
</style>
