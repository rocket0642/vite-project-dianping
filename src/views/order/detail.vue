<script setup>
import { ElMessage, ElMessageBox, ElStep, ElSteps, ElTag } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
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

// 状态
const loading = ref(true)
const order = ref({})
const orderId = route.params.id
const isCommented = ref(false)

// 订单状态步骤
const orderSteps = computed(() => {
  const steps = [
    { title: '提交订单', description: order.value.createTime || '' },
    { title: '支付', description: order.value.payTime || '待支付' },
    { title: '商家发货', description: order.value.deliveryTime || '等待商家发货' },
    { title: '确认收货', description: order.value.status === 5 ? '已完成' : '订单完成' }
  ]

  return steps
})

// 当前步骤
const activeStep = computed(() => {
  switch (order.value.status) {
    case 1: return 0 // 待付款
    case 2: return 1 // 已支付
    case 3: return -1 // 已取消
    case 4: return 2 // 待收货
    case 5: return 3 // 已完成
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
    case 2: return '已支付'
    case 3: return '已取消'
    case 4: return '待收货'
    case 5: return '已完成'
    default: return '未知状态'
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
 * 加载订单详情
 */
const loadOrderDetail = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder
    // 如果订单已完成，检查是否已评价
    if (order.value.status === 5) {
      await checkOrderIsCommented()
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
const confirmReceipt = () => {
  ElMessageBox.confirm(
    '确认已收到商品吗？',
    '确认收货',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await orderStore.deliveryUserOrder(orderId)
        if (res.success) {
          ElMessage.success('确认收货成功')
          loadOrderDetail()
        } else {
          ElMessage.error(res.errorMsg || '确认收货失败')
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        ElMessage.error('确认收货失败，请稍后重试')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
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
  router.push(`/order/after-sale/${orderId}`)
}

/**
 * 评价订单
 */
const goToComment = () => {
  router.push(`/order/comment/${orderId}`)
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
              订单状态:
              <el-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
            <div class="status-actions">
              <el-button v-if="order.status === 1" type="primary" size="small" @click="goToPay">
                去支付
              </el-button>
              <el-button v-if="order.status === 1" type="default" size="small" @click="cancelOrder">
                取消订单
              </el-button>
              <el-button v-if="order.status === 4" type="primary" size="small" @click="confirmReceipt">
                确认收货
              </el-button>
              <el-button v-if="order.status === 4" type="default" size="small" @click="viewLogistics">
                查看物流
              </el-button>
              <el-button v-if="order.status === 5 && !isCommented" type="warning" size="small" @click="goToComment">
                评价订单
              </el-button>
              <el-button v-if="order.status === 4 || order.status === 5" type="default" size="small"
                @click="applyRefund">
                申请售后
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
          <div v-if="order.items && order.items.length" class="order-products">
            <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="goods-info">
              <div class="goods-name">{{ item.goodsName }}</div>
              <div class="goods-quantity">x{{ item.count }}</div>
              <div class="goods-price">¥{{ formatPrice(item.price) }}</div>
            </div>
          </div>

          <div class="order-amount">
            <div class="amount-text">订单金额</div>
            <div class="amount-value">¥{{ formatPrice(order.amount) }}</div>
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
}

.status-title {
  font-size: 14px;
  color: #333;
}

.status-actions {
  display: flex;
  gap: 10px;
}

.order-steps-section {
  margin-bottom: 20px;
}

.order-content-section {
  margin-bottom: 20px;
}

.goods-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.goods-name {
  flex: 1;
  font-weight: bold;
}

.goods-quantity {
  margin: 0 20px;
  color: #666;
}

.goods-price {
  font-weight: bold;
  color: #f60;
}

.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}

.amount-text {
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: bold;
  color: #f60;
}
</style>
