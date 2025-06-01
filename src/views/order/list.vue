<script setup>
import { ElButton, ElMessage, ElPagination } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import AddressDialog from '../../components/order/AddressDialog.vue'
import OrderItem from '../../components/order/OrderItem.vue'
import OrderTabs from '../../components/order/OrderTabs.vue'
import { useAddressStore } from '../../stores/address'
import { useOrderStore } from '../../stores/order'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useUserStore } from '../../stores/user'

// 路由和存储
const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const userStore = useUserStore()
const addressStore = useAddressStore()
const afterSaleStore = useAfterSaleStore()
// 状态
const loading = ref(false)
// 使用store中的页面状态，而不是本地状态
const activeTab = computed({
  get: () => orderStore.orderListPageState.activeTab,
  set: (val) => orderStore.orderListPageState.activeTab = val
})
const pageSize = ref(5) // 每页显示5条记录
const countdowns = ref({}) // 用于存储倒计时显示值
const timers = ref({})

// 分页状态使用store中的数据
const paginationState = computed({
  get: () => orderStore.orderListPageState.paginationState,
  set: (val) => orderStore.orderListPageState.paginationState = val
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
  set: (val) => {
    orderStore.orderListPageState.paginationState[activeTab.value].currentPage = val
  }
})
const total = computed(() => paginationState.value[activeTab.value].total)

/**
 * 修复版await loadOrders - 完全解决缓存不一致问题
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
      'uncommented': 5,
      'afterSale': 6  // 添加售后服务状态
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

    // 更新store中的分页状态
    orderStore.orderListPageState.paginationState[activeTab.value].total = result.total || 0;

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

  const createTime = new Date(order.createTime).getTime()
  const expireTime = createTime + 20 * 60 * 1000
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
    await loadOrders()
    // 如果订单状态不是3（已取消），则先调用取消接口
    if (orders.value && orders.value.status !== 3 && orders.value.status !== 2) {
      const res = await orderStore.cancelUserOrder({
        orderId,
        cancelReason: `超时自动取消`
      })
      if (!res.success) {
        ElMessage.error(res.errorMsg || '订单取消失败')
      } else {
        ElMessage.info(`订单 ${orderId} 已超时自动取消`)
        await loadOrders()
      }
    } else {
      ElMessage.info(`订单 ${orderId} 已超时自动取消`)
    }
  } catch (error) {
    console.error('取消过期订单失败:', error)
    ElMessage.error('取消过期订单失败，请稍后重试')
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
  // 更新store中的页面状态
  orderStore.orderListPageState.activeTab = tab;
  // 不重置页码，直接使用各自的currentPage
  router.push({ query: { status: tabToStatusMap[tab] } });
  loadOrders();
}

/**
 * 分页变化
 */
const handlePageChange = (page) => {
  // 更新store中的页面状态
  orderStore.orderListPageState.paginationState[activeTab.value].currentPage = page;
  loadOrders();
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
  router.push(`/order/pay/${orderId}`)
}

/**
 * 取消订单
 */
const cancelOrder = async (orderId) => {
  try {
    const res = await orderStore.cancelUserOrder({
      orderId,
      cancelReason: `用户取消`
    })
    if (res.success) {
      ElMessage.success('订单已取消')
      if (timers.value[orderId]) {
        clearInterval(timers.value[orderId])
        delete timers.value[orderId]
      }
      await loadOrders()
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
    const res = await orderStore.deliveryUserOrder(orderId)
    if (res.success) {
      ElMessage.success('已确认收货')
      await loadOrders()
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
  router.push(`/shop/${order.shopId}`)
}

/**
 * 修复版的去评价函数
 */
const goToComment = (orderId) => {
  router.push(`/order/comment/${orderId}`)
}

/**
 * 申请退款（原始功能，保留但不使用）
 */
const applyRefund = (orderId) => {
  // 直接跳转到售后申请页面
  router.push(`/order/after-sale/${orderId}`)
}

/**
 * 申请售后
 */
const applyAfterSale = (orderId) => {
  router.push(`/order/after-sale/${orderId}`)
}

/**
 * 查看物流
 */
const viewLogistics = (orderId) => {
  router.push(`/order/logistics/${orderId}`)
}

/**
 * 加载用户地址列表
 */
const loadUserAddresses = async () => {
  addressesLoading.value = true
  try {
    // 首先确保用户已登录
    if (!userStore.isLogin) {
      ElMessage.warning('请先登录')
      router.push('/login?redirect=/order/list')
      return
    }

    await addressStore.fetchAddresses()
    addresses.value = addressStore.addressList || []

    console.log('加载的地址列表:', addresses.value)

    // 只有当有地址时才设置selectedAddress
    if (addresses.value.length > 0) {
      selectedAddress.value = addressStore.defaultAddress || addresses.value[0]
    } else {
      selectedAddress.value = null
    }
  } catch (error) {
    console.error('加载地址列表失败:', error)
    ElMessage.error('加载地址列表失败，请稍后重试')
  } finally {
    addressesLoading.value = false
  }
}

/**
 * 打开地址选择对话框
 */
const openAddressDialog = (orderId) => {
  currentOrderId.value = orderId
  loadUserAddresses().then(() => {
    // 只在加载地址后再显示对话框
    addressDialogVisible.value = true
  })
}

/**
 * 更新订单地址
 */
const updateOrderAddress = async (address) => {
  if (!address) {
    ElMessage.warning('请选择收货地址')
    return
  }

  try {
    const order = orders.value.find(o => o.id === currentOrderId.value)
    if (order) {
      order.addressId = address.id
      order.addressName = address.name
      order.addressPhone = address.phone
      order.addressDetail = address.address
    }

    ElMessage.success('收货地址已更新')
  } catch (error) {
    console.error('更新地址失败:', error)
    ElMessage.error('更新地址失败，请稍后重试')
  }
}

/**
 * 查看售后详情
 */
const viewAfterSaleDetail = async (orderId) => {
  try {
    // 先加载该订单的售后记录
    const afterSales = await afterSaleStore.fetchOrderAfterSales(orderId)
    if (afterSales && afterSales.length > 0) {
      // 如果有售后记录，跳转到第一条售后记录的详情页
      router.push(`/order/after-sale-detail/${afterSales[0].id}`)
    } else {
      // 如果没有售后记录，提示用户并跳转到申请售后页面
      ElMessage.info('该订单暂无售后记录，请先申请售后')
      router.push(`/order/after-sale/${orderId}`)
    }
  } catch (error) {
    console.error('查询售后记录失败:', error)
    ElMessage.error('查询售后记录失败，请稍后重试')
  }
}

// 合并tabToStatusMap定义，避免重复定义
const tabToStatusMap = {
  'all': undefined,
  'paid': [2, 4, 5],
  'unpaid': 1,
  'canceled': 3,
  'unreceived': 4,
  'uncommented': 5,
  'afterSale': 6
};

// 初始化
onMounted(async () => {
  const status = parseInt(route.query.status) || 0;
  const fromUserCenter = route.query.fromUserCenter === 'true';
  const statusToTabMap = {
    0: 'all',
    2: 'paid',
    1: 'unpaid',
    3: 'canceled',
    4: 'unreceived',
    5: 'uncommented',
    6: 'afterSale'
  };

  // 如果URL中有状态参数，则使用它，否则使用store中保存的activeTab
  if (route.query.status) {
    const tabName = statusToTabMap[status] || 'all';
    orderStore.orderListPageState.activeTab = tabName;

    // 如果是从个人中心点击过来的，重置页码为1
    if (fromUserCenter) {
      orderStore.orderListPageState.paginationState[tabName].currentPage = 1;
    }
  }

  await loadOrders();
});

// 监听路由参数变化
watch(
  () => route.query,
  (newQuery) => {
    const status = parseInt(newQuery.status) || 0;
    const fromUserCenter = newQuery.fromUserCenter === 'true';
    const statusToTabMap = {
      0: 'all',
      2: 'paid',
      1: 'unpaid',
      3: 'canceled',
      4: 'unreceived',
      5: 'uncommented',
      6: 'afterSale'
    };

    // 仅当路由状态参数与当前activeTab不一致时更新
    const newTab = statusToTabMap[status] || 'all';
    if (newTab !== orderStore.orderListPageState.activeTab || fromUserCenter) {
      orderStore.orderListPageState.activeTab = newTab;

      // 如果是从个人中心点击过来的，重置页码为1
      if (fromUserCenter) {
        orderStore.orderListPageState.paginationState[newTab].currentPage = 1;
      }

      loadOrders();
    }
  },
  { deep: true }
);

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  clearAllTimers()
})
</script>

<template>
  <AppLayout>
    <div class="order-list-container" v-loading="loading">
      <div class="list-header">
        <el-button type="text" icon="ArrowLeft" @click="$router.push('/user')">返回个人中心</el-button>
      </div>

      <!-- 使用拆分出的OrderTabs组件 -->
      <OrderTabs :active-tab="activeTab" @tab-change="handleTabChange" />

      <div v-if="orders.length === 0" class="no-orders">
        暂无订单
      </div>

      <div v-else class="orders-scroll-container">
        <!-- 使用拆分出的OrderItem组件 -->
        <OrderItem v-for="order in orders" :key="order.id" :order="order" :countdown="countdowns[order.id]"
          @view-detail="viewOrderDetail" @go-to-pay="goToPay" @buy-again="buyAgain" @cancel-order="cancelOrder"
          @confirm-order="confirmOrder" @view-logistics="viewLogistics" @go-to-comment="goToComment"
          @apply-refund="applyAfterSale" @apply-after-sale="applyAfterSale"
          @view-after-sale-detail="viewAfterSaleDetail" @go-to-shop-detail="goToShopDetail"
          @go-to-goods-detail="goToGoodsDetail" @open-address-dialog="openAddressDialog" />

        <!-- 分页组件 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
            layout="prev, pager, next" @current-change="handlePageChange" background />
        </div>
      </div>

      <!-- 使用拆分出的AddressDialog组件 -->
      <AddressDialog :visible="addressDialogVisible" @update:visible="addressDialogVisible = $event"
        :addresses="addresses" :loading="addressesLoading" @confirm="updateOrderAddress"
        @cancel="addressDialogVisible = false" />
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

.list-header {
  margin-bottom: 15px;
}

.no-orders {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-size: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .order-list-container {
    width: 95%;
    padding: 10px;
  }
}
</style>
