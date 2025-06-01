<template>
  <div class="result-container">
    <div class="result-card">
      <div class="result-icon" :class="{ success: paymentSuccess, pending: !paymentSuccess }">
        <i v-if="paymentSuccess" class="el-icon-success"></i>
        <i v-else class="el-icon-time"></i>
      </div>

      <h1 class="result-title">{{ paymentSuccess ? '支付成功' : '等待支付' }}</h1>

      <div class="result-message">
        {{ paymentSuccess ? '您的订单已支付成功，感谢您的惠顾！' : '您的订单正在处理中，请稍候...' }}
      </div>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单编号</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式</span>
          <span class="value">{{ payTypeName }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" @click="goToOrderDetail">订单详情</el-button>
        <el-button @click="goToOrderList">订单列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../../stores/order'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = ref(route.query.orderId)
const paymentSuccess = ref(route.query.payResult === 'success')
const payType = ref(localStorage.getItem(`order_payment_type_${orderId.value}`) || '2')
const payTypeName = ref(payType.value === '1' ? '微信支付' : '支付宝支付')

let statusCheckInterval = null

onMounted(() => {
  if (!paymentSuccess.value) {
    // 每3秒查询一次支付状态
    statusCheckInterval = setInterval(checkPayStatus, 3000)
    // 立即查询一次
    checkPayStatus()
  }
})

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})

async function checkPayStatus() {
  try {
    const result = await orderStore.checkPaymentStatus(orderId.value)
    if (result) {
      paymentSuccess.value = true
      clearInterval(statusCheckInterval)
      // 显示成功通知
      ElMessage.success('支付成功！')
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
  }
}

function goToOrderDetail() {
  router.push(`/order/detail/${orderId.value}`)
}

function goToOrderList() {
  router.push('/order/list')
}
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
}

.result-card {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.result-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 24px;
  font-size: 40px;
}

.result-icon.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.result-icon.pending {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.result-title {
  font-size: 28px;
  margin-bottom: 16px;
  color: #303133;
}

.result-message {
  color: #606266;
  font-size: 16px;
  margin-bottom: 32px;
}

.order-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  font-size: 14px;
}

.value {
  color: #303133;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .result-card {
    padding: 30px 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
