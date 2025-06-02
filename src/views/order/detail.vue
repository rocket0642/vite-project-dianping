<script setup>
import { ElMessage, ElMessageBox, ElStep, ElSteps, ElTag } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useCommentStore } from '../../stores/comment'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()
const userStore = useUserStore()
const commentStore = useCommentStore()
const afterSaleStore = useAfterSaleStore()

// 状态
const loading = ref(true)
const order = ref({})
const orderId = route.params.id
const isCommented = ref(false)
const afterSaleStatus = ref(0) // 新增售后状态

// 订单状态步骤
const orderSteps = computed(() => {
  const steps = [
    { title: '提交订单', description: order.value.createTime || '' },
    { title: '支付', description: order.value.payTime || '待支付' },
    { title: '商家发货', description: order.value.deliveryTime || '商家已发货' },
    { title: '确认收货', description: order.value.status === 5 ? '已完成' : '待收货' }
  ]

  return steps
})

// 当前步骤
const activeStep = computed(() => {
  switch (order.value.status) {
    case 1: return 0  // 待付款
    case 2: return 1  // 已支付，等待发货
    case 3: return -1 // 已取消
    case 4: return 2  // 已发货，待收货
    case 5: return 3  // 已完成
    default: return 0
  }
})

// 通用的价格格式化方法
const formatPrice = (price) => (price / 100).toFixed(2);

/**
 * 获取订单状态文本
 * @param {number} status - 订单状态
 * @returns {string} - 状态文本
 */
const getStatusText = (status) => {
  switch (status) {
    case 1: return '待付款'
    case 2: return '待发货'  // 已支付，等待商家发货
    case 3: return '已取消'
    case 4: return '待收货'  // 已发货，等待收货
    case 5: return '已完成'  // 确认收货后的状态
    default: return '未知状态'
  }
}

/**
 * 获取售后状态文本
 * @param {number} status - 售后状态
 * @returns {string} - 状态文本
 */
const getAfterSaleStatusText = (status) => {
  switch (status) {
    case 0: return '无售后'
    case 1: return '售后处理中'
    case 2: return '售后完成'
    case 3: return '售后拒绝'
    default: return '无售后'
  }
}

/**
 * 获取订单状态对应的标签类型
 * @param {number} status - 订单状态
 * @returns {string} - 标签类型
 */
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'info'
    case 4: return 'primary'
    case 5: return 'success'
    default: return 'info'
  }
}

/**
 * 获取售后状态对应的标签类型
 * @param {number} status - 售后状态
 * @returns {string} - 标签类型
 */
const getAfterSaleStatusType = (status) => {
  switch (status) {
    case 0: return ''
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

/**
 * 检查订单是否已评价
 */
const checkOrderIsCommented = async () => {
  try {
    isCommented.value = await commentStore.checkIfOrderCommented(orderId)
  } catch (error) {
    console.error('检查订单评价状态失败:', error)
  }
}

/**
 * 检查订单售后状态
 */
const checkAfterSaleStatus = async () => {
  try {
    const afterSales = await afterSaleStore.fetchOrderAfterSales(orderId)
    if (afterSales && Array.isArray(afterSales) && afterSales.length > 0) {
      // 获取最新的售后状态
      afterSaleStatus.value = afterSales[0].status || 0
    } else {
      afterSaleStatus.value = 0
    }
  } catch (error) {
    console.error('检查售后状态失败:', error)
    afterSaleStatus.value = 0
  }
}

/**
 * 加载订单详情
 */
const loadOrderDetail = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder

    // 如果订单已完成
    if (order.value.status === 5) {
      // 检查是否已评价
      await checkOrderIsCommented()
      // 检查售后状态
      await checkAfterSaleStatus()
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 去支付订单
 */
const goToPay = () => {
  router.push(`/order/pay/${orderId}`)
}

/**
 * 取消订单
 */
const cancelOrder = () => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await orderStore.cancelUserOrder({
          orderId,
          cancelReason: `用户取消订单`
        })
        if (res.success) {
          ElMessage.success('订单已取消')
          loadOrderDetail()
        } else {
          ElMessage.error(res.errorMsg || '取消订单失败')
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请稍后重试')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

/**
 * 返回订单列表
 */
const goToOrderList = () => {
  router.push('/order/list')
}

/**
 * 确认收货
 */
const confirmReceipt = async () => {
  try {
    const res = await orderStore.deliveryUserOrder(orderId)
    if (res.success) {
      ElMessage.success('确认收货成功')
      await loadOrderDetail()  // 刷新订单详情
    } else {
      ElMessage.error(res.errorMsg || '确认收货失败')
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败，请稍后重试')
  }
}

/**
 * 查看物流
 */
const viewLogistics = () => {
  router.push(`/order/logistics/${orderId}`)
}

/**
 * 申请售后/退款
 */
const applyRefund = () => {
  router.push(`/order/after-sale-create/${orderId}`)
}

/**
 * 查看售后记录
 */
const viewAfterSaleRecords = () => {
  router.push(`/order/after-sale-records/${orderId}`)
}

/**
 * 查看售后详情
 */
const viewAfterSaleDetail = async () => {
  try {
    const afterSales = await afterSaleStore.fetchOrderAfterSales(orderId)
    if (afterSales && afterSales.length > 0) {
      const latestAfterSale = afterSales[0]
      router.push(`/order/after-sale-detail/${latestAfterSale.id}`)
    } else {
      ElMessageBox.alert('没有找到相关售后记录', '提示', {
        confirmButtonText: '确定'
      })
    }
  } catch (error) {
    console.error('查看售后详情失败:', error)
  }
}

/**
 * 评价订单
 */
const goToComment = () => {
  router.push(`/order/comment/${orderId}`)
}

/**
 * 再次购买
 */
const buyAgain = () => {
  if (order.value && order.value.shopId) {
    router.push(`/shop/${order.value.shopId}`)
  } else {
    ElMessage.warning('无法获取商店信息')
  }
}

// 初始化
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/detail/' + orderId)
    return
  }

  loadOrderDetail()
})
</script>

<template>
  <AppLayout>
    <div class="order-detail-container">
      <div class="page-header">
        <el-button type="text" icon="ArrowLeft" @click="goToOrderList">返回订单列表</el-button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载订单详情...</p>
      </div>

      <template v-else>
        <div class="page-header">
          <h1>订单详情</h1>
        </div>

        <!-- 订单状态 -->
        <div class="order-status-section">
          <div class="status-info">
            <div class="status-title">
              <div class="status-tags">
                订单状态:
                <el-tag :type="getStatusType(order.status)">
                  {{ getStatusText(order.status) }}
                </el-tag>

                <!-- 添加售后状态标签 -->
                <el-tag v-if="afterSaleStatus > 0" :type="getAfterSaleStatusType(afterSaleStatus)"
                  class="after-sale-tag">
                  {{ getAfterSaleStatusText(afterSaleStatus) }}
                </el-tag>
              </div>
            </div>
            <div class="status-actions">
              <!-- 待付款订单操作 -->
              <el-button v-if="order.status === 1" type="primary" size="small" @click="goToPay">
                去支付
              </el-button>
              <el-button v-if="order.status === 1" type="default" size="small" @click="cancelOrder">
                取消订单
              </el-button>

              <!-- 待收货订单操作 -->
              <el-button v-if="order.status === 4" type="primary" size="small" @click="confirmReceipt">
                确认收货
              </el-button>
              <el-button v-if="order.status === 4" type="default" size="small" @click="viewLogistics">
                查看物流
              </el-button>

              <!-- 已完成订单操作 -->
              <el-button v-if="order.status === 5 && !isCommented" type="warning" size="small" @click="goToComment">
                评价订单
              </el-button>

              <!-- 售后操作 -->
              <el-button v-if="order.status === 5 && (afterSaleStatus === 0 || afterSaleStatus === 3)" type="default"
                size="small" @click="applyRefund">
                申请售后
              </el-button>

              <el-button v-if="order.status === 5 && afterSaleStatus > 0" type="info" size="small"
                @click="viewAfterSaleDetail">
                查看售后
              </el-button>

              <el-button v-if="order.status === 5" type="success" size="small" @click="viewAfterSaleRecords">
                售后记录
              </el-button>

              <!-- 通用操作 -->
              <el-button v-if="order.status === 5 || order.status === 3" type="primary" size="small" @click="buyAgain">
                再次购买
              </el-button>
            </div>
          </div>
        </div>

        <!-- 订单步骤 -->
        <div class="order-steps-section">
          <el-steps :active="activeStep" direction="vertical" finish-status="success">
            <el-step v-for="(step, index) in orderSteps" :key="index" :title="step.title"
              :description="step.description"></el-step>
          </el-steps>
        </div>

        <!-- 订单内容 -->
        <div class="order-content-section">
          <h3>商品信息</h3>
          <!-- 订单商品列表 -->
          <div v-if="order.items && order.items.length" class="order-products">
            <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="product-item">
              <div class="product-image">
                <img
                  :src="item.goodsImage && item.goodsImage[0] || 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'"
                  :alt="item.goodsName" />
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ item.goodsName }}</h4>
                <p class="product-sku">{{ item.skuName }}</p>
                <div class="product-price-qty">
                  <span class="product-price">¥{{ formatPrice(item.price) }}</span>
                  <span class="product-qty">x {{ item.count }}</span>
                </div>
              </div>
              <div class="product-subtotal">¥{{ formatPrice(item.price * item.count) }}</div>
            </div>
          </div>

          <!-- 订单金额信息 -->
          <div class="order-summary">
            <div class="summary-item">
              <span>商品总额:</span>
              <span>¥{{ formatPrice(order.amount) }}</span>
            </div>
            <div class="summary-item">
              <span>订单总价:</span>
              <span class="order-total-price">¥{{ formatPrice(order.amount) }}</span>
            </div>
          </div>

          <!-- 收货信息 -->
          <div class="delivery-info">
            <h3>收货信息</h3>
            <div class="info-item">
              <span class="label">收货人:</span>
              <span>{{ order.addressName }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话:</span>
              <span>{{ order.addressPhone }}</span>
            </div>
            <div class="info-item">
              <span class="label">收货地址:</span>
              <span>{{ order.addressDetail }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-detail-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 22px;
  color: #333;
  margin: 0;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.order-status-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.status-title {
  font-size: 14px;
  color: #333;
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.after-sale-tag {
  margin-left: 10px;
}

.status-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.order-steps-section {
  margin-bottom: 30px;
}

.order-content-section {
  margin-bottom: 30px;
}

.order-content-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.order-products {
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px dashed #ebeef5;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
  border: 1px solid #ebeef5;
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
  font-size: 14px;
  color: #303133;
  margin: 0 0 5px 0;
}

.product-sku {
  font-size: 12px;
  color: #909399;
  margin: 0 0 5px 0;
}

.product-price-qty {
  display: flex;
  justify-content: space-between;
}

.product-price {
  color: #303133;
}

.product-qty {
  color: #606266;
}

.product-subtotal {
  width: 100px;
  text-align: right;
  color: #f56c6c;
  font-weight: bold;
}

.order-summary {
  background-color: #fafafa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item:last-child {
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.order-total-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.delivery-info {
  margin-top: 30px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item .label {
  display: inline-block;
  width: 80px;
  color: #606266;
}

@media (max-width: 768px) {
  .status-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-actions {
    margin-top: 15px;
    justify-content: flex-start;
    width: 100%;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
  }

  .product-subtotal {
    width: 100%;
    text-align: left;
    margin-top: 10px;
  }
}
</style>
