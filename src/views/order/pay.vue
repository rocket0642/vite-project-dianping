<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElButton } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'

// 路由实例
const route = useRoute()
const router = useRouter()

// 订单状态管理
const orderStore = useOrderStore()

// 状态
const loading = ref(true)
const paying = ref(false)
const order = ref({})
const orderId = parseInt(route.params.id)
const payType = ref(1) // 默认微信支付
const countdown = ref(30 * 60) // 默认30分钟支付倒计时
const timer = ref(null)

// 计算属性
const formatAmount = computed(() => {
  return order.value.amount ? (order.value.amount / 100).toFixed(2) : '0.00'
})

const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * 加载订单数据
 */
const loadOrder = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder
    
    // 如果订单已支付，跳转到订单详情页
    if (order.value.status !== 1) {
      ElMessage.info('订单已支付或已取消')
      router.replace(`/order/${orderId}`)
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('订单不存在或已失效')
    router.replace('/order/list')
  } finally {
    loading.value = false
  }
}

/**
 * 支付订单
 */
const payOrder = async () => {
  if (paying.value) return
  
  paying.value = true
  try {
    const res = await orderStore.payUserOrder(orderId, payType.value)
    if (res.success) {
      ElMessage.success('支付成功')
      // 跳转到订单详情页
      router.push(`/order/${orderId}`)
    } else {
      ElMessage.error(res.errorMsg || '支付失败')
    }
  } catch (error) {
    console.error('支付订单失败:', error)
    ElMessage.error('支付失败，请稍后重试')
  } finally {
    paying.value = false
  }
}

/**
 * 取消订单
 */
const cancelOrder = async () => {
  try {
    const res = await orderStore.cancelUserOrder(orderId)
    if (res.success) {
      ElMessage.success('订单已取消')
      router.push('/order/list')
    } else {
      ElMessage.error(res.errorMsg || '取消订单失败')
    }
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败，请稍后重试')
  }
}

/**
 * 选择支付方式
 */
const selectPayType = (type) => {
  payType.value = type
}

/**
 * 启动倒计时
 */
const startCountdown = () => {
  clearInterval(timer.value)
  
  timer.value = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      ElMessage.warning('支付超时，订单已自动取消')
      router.push('/order/list')
    }
  }, 1000)
}

/**
 * 页面挂载时加载数据
 */
onMounted(() => {
  loadOrder()
  startCountdown()
})

/**
 * 页面销毁前清除定时器
 */
onBeforeUnmount(() => {
  clearInterval(timer.value)
})
</script>

<template>
  <AppLayout>
    <div class="order-pay-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载订单信息...</p>
      </div>
      
      <template v-else>
        <div class="pay-header">
          <h1>订单支付</h1>
          <div class="countdown">
            支付剩余时间：<span class="time">{{ countdownText }}</span>
          </div>
        </div>
        
        <div class="order-info">
          <div class="info-row">
            <span class="label">订单号：</span>
            <span class="value">{{ order.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">商品名称：</span>
            <span class="value">{{ order.goodsName }}</span>
          </div>
          <div class="info-row">
            <span class="label">商品数量：</span>
            <span class="value">{{ order.count }}件</span>
          </div>
          <div class="info-row amount">
            <span class="label">应付金额：</span>
            <span class="value price">¥{{ formatAmount }}</span>
          </div>
        </div>
        
        <div class="pay-methods">
          <h2 class="section-title">支付方式</h2>
          <div class="methods-container">
            <div 
              :class="['method-item', { active: payType === 1 }]"
              @click="selectPayType(1)"
            >
              <div class="method-icon wechat"></div>
              <div class="method-name">微信支付</div>
            </div>
            <div 
              :class="['method-item', { active: payType === 2 }]"
              @click="selectPayType(2)"
            >
              <div class="method-icon alipay"></div>
              <div class="method-name">支付宝</div>
            </div>
          </div>
        </div>
        
        <div class="pay-actions">
          <el-button @click="cancelOrder">取消订单</el-button>
          <el-button 
            type="primary" 
            :loading="paying"
            @click="payOrder"
          >
            立即支付
          </el-button>
        </div>
        
        <div class="pay-tips">
          <p>支付提示：</p>
          <ul>
            <li>请在下单后30分钟内完成支付，超时订单会自动取消</li>
            <li>如有疑问，请联系客服电话：400-123-4567</li>
          </ul>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-pay-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.pay-header h1 {
  font-size: 22px;
  color: #333;
}

.countdown {
  font-size: 16px;
  color: #666;
}

.time {
  color: #f56c6c;
  font-weight: bold;
}

.order-info {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row.amount {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

.label {
  width: 100px;
  color: #666;
}

.value {
  flex: 1;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #409EFF;
  border-radius: 2px;
}

.methods-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.method-item {
  width: 180px;
  height: 80px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #c0c4cc;
}

.method-item.active {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.method-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.method-icon.wechat {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB0PSIxNjkwNTQzMjgyNzQ2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMyMzciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMzA4LjY1NiA0MDYuMTI4YTM4LjA4IDM4LjA4IDAgMSAwIDcxLjQ4OC0xNy4xNTIgMzguMDggMzguMDggMCAwIDAtNzEuNDg4IDE3LjE1MnoiIGZpbGw9IiM0QkQ3NUYiIHAtaWQ9IjMyMzgiPjwvcGF0aD48cGF0aCBkPSJNNjA2LjA4IDMxNC40OTZhMzMuMTUyIDMzLjE1MiAwIDEgMCA2Mi4yNzItMTUuMDQgMzMuMTUyIDMzLjE1MiAwIDAgMC02Mi4yNzIgMTUuMDR6IiBmaWxsPSIjNEJENzVGIiBwLWlkPSIzMjM5Ij48L3BhdGg+PHBhdGggZD0iTTUxMiA0LjYwOGMtMjgwLjc2OCAwLTUwOC4xNiAyMjcuMzkyLTUwOC4xNiA1MDguMTYgMCAyODAuNzY4IDIyNy4zOTIgNTA3LjM5MiA1MDguMTYgNTA3LjM5MiAyODAuNzY4IDAgNTA3LjM5Mi0yMjYuNjI0IDUwNy4zOTItNTA3LjM5MiAwLTI4MC43NjgtMjI2LjYyNC01MDguMTYtNTA3LjM5Mi01MDguMTZ6IG0tOTkuNDU2IDYzNi4yODhjLTI2LjQ5NiAwLTQ3LjYxNi01LjM3Ni03My45MzYtMTAuNzUybC03My45MzYgMzYuOTkyIDIxLjEyLTYzLjM2Yy01Mi45OTItMzYuOTkyLTg0LjY3Mi04NC42NzItODQuNjcyLTE0Mi44NDggMC04NC42NzIgNzMuOTM2LTE0Ny45NjggMjExLjQ1Ni0xNDcuOTY4IDEwMy44NTYgMCAxOTUuNDU2IDYzLjM2IDIxMS40NTYgMTQ4LjczNi00Ny42MTYtNS4zNzYtNDcuNjE2LTUuMzc2LTg5LjI4LTUuMzc2LTEwNS4zOTIgMC0xOTAuMDggNzkuMjk2LTE5MC4wOCAxNzQuNDY0IDAgMTYuMTI4IDBcIDEwLjc1MiA1LjM3NiAxNi4xMjhIM#ze1LjczNnogbTMyNi4yNzIgNzMuOTM2bDE1Ljc0NCA1Mi45OTItNTcuNjAtMzEuODcyYy0yMS4xMiA1LjM3Ni00Mi4yNCAMTAuNzUyLTYzLjM2IDEwLjc1Mi05NC43MiAwLTE2OS4wODgtNjMuMzYtMTY5LjA4OC0xNDIuODQ4IDAtNzkuMjk2IDc0LjM2OC0xNDIuODQ4IDE2OS4wODgtMTQyLjg0OCA4OS4yOCAwIDE2OC4zMiA2My4zNiAxNjguMzIgMTQyLjg0OCAwIDQ3LjYxNi0zMS44NzIgOS41LjM2OC04NC42NzIgMTMMS42NHoiIGZpbGw9IiM0QkQ3NUYiIHAtaWQ9IjMyNDAiPjwvcGF0aD48cGF0aCBkPSJNNTU4LjQ2NCA2OTguNjg4YTI3LjY0OCAyNy42NDggMCAxIDAgNTIuMDk2LTEzLjE4NCAyNy42NDggMjcuNjQ4IDAgMCAwLTUyLjA5NiAxMy4xODR6IiBmaWxsPSIjNEJENzVGIiBwLWlkPSIzMjQxIj48L3BhdGg+PHBhdGggZD0iTTcyNS40MDggNjI5Ljc2YTMzLjE1MiAzMy4xNTIgMCAxIDAgNjEuNTA0LTE1LjgwOCAzMy4xNTIgMzMuMTUyIDAgMCAwLTYxLjUwNCAxNS44MDh6IiBmaWxsPSIjNEJENzVGIiBwLWlkPSIzMjQyIj48L3BhdGg+PC9zdmc+');
}

.method-icon.alipay {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB0PSIxNjkwNTQzMjU5NDA2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2MTMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMjMwLjkgNzk5LjdjLTE0LjYgMC0yOS0yLjItNDIuOC02LjRsMCAwYy02Mi41LTE5LjEtOTguMi04Mi4yLTc5LjEtMTQ0LjcgMTkuMS02Mi41IDgyLjItOTguMiAxNDQuNy03OS4xIDYyLjUgMTkuMSA5OC4yIDgyLjIgNzkuMSAxNDQuNyAwIDAgMCAwIDAgMC0xNC43IDQ4LjEtNTguNyA4Mi4xLTEwOS40IDgyLjEgMCAwIDAgMCAwIDBsMi41IDMuNFpNNzEuNCA2MTEuM2MtMTUuNiA1MC45IDEzLjMgMTA0LjYgNjQuMiAxMjAuMiA1MC45IDE1LjYgMTA0LjYtMTMuMyAxMjAuMi02NC4yIDE1LjYtNTAuOS0xMy4zLTEwNC42LTY0LjItMTIwLjJzLTEwNC42IDEzLjMtMTIwLjIgNjQuMmMtMC4xLTAuMSAwIDAgMCAweiIgZmlsbD0iIzEyOTZEQiIgcC1pZD0iMjYxNCI+PC9wYXRoPjxwYXRoIGQ9Ik05NDkuNCA1MTJDOTQ5LjQgMjM0LjkgNzI2LjUgMTIgNDQ5LjQgMTJzLTUwMCAyMjMtNTAwIDUwMGMwIDI3Ni4xIDIyMi45IDUwMCA1MDAgNTAwIDg1LjYgMCAxNjYuMS0yMS42IDIzNi4zLTU5LjYgMi4yLTEuMiA0LjctMS45IDcuMy0xLjkgMi43IDAgNS4zIDAuNyA3LjYgMiA0LjQgMi44IDYuOSA3LjcgNi45IDEyLjkgMCAwLjQgMCAwLjkgMCAxLjMtMC4yIDQuMS0yLjQgNy45LTUuNyAxMC4yLTc1LjUgNDEuMS0xNjIuMSA2NC4zLTI1My45IDY0LjMtMjkxLjQgMC01MjgtMjM2LjYtNTI4LTUyOHMyMzYuNi01MjggNTI4LTUyOCA1MjggMjM2LjYgNTI4IDUyOHYwYzAgNTAuNC03LjIgOTkuMi0yMC44IDE0NS41IDAgMC0wLjUgMC43LTEuMSAxLjUtNTIuMyA4OC4xLTIyOS4yIDEzNi4zLTM2NC4xIDE1NS41LTUxLjcgNy4zLTc3IDExLTkxIDEzLjEgMCAwLTIuNyAwLjItNyAwLjYtMi43IDAuMi01LjYgMC42LTguOCAwLjl2LTk5LjZjMTMuMi0xMC4yIDMyLjctMjUuNyAzMi43LTI1LjdTNjczIDM3OC4xIDY4NSAzNjAuNGMyNC42LTM2LjYgNDYuNC04Ny45IDQ2LjQtMTI0LjEgMC0xMTIuNi0xMjcuMi0xNzAuOS0yMTcuMS0xMDIuNi01OS4xIDQ1LTYwLjMgMTExLjEtNjAuMyAxMTEuMXMyLjUgNDUuNyAzNy44IDQ3LjRjMC4xIDAgMC4zIDAgMC40IDAuMSA1LjcgMC45IDExLjUtMS41IDE1LjItNi4yIDEuMS0xLjQgMi4xLTIuOSAzLTQuNSA0LjctOC40IDcuMi0xOC40IDcuMi0yOS4yIDAtMi41LTAuMS00LjktMC40LTcuMy0yLjYtMjIuNyAzLjktNDUuNyAxOC4xLTY0IDQwLjItNTEuOCAxMDguNS0zNi4zIDEyNC44IDI0LjQgNi42IDI0LjEgMy43IDQ5LjgtOC41IDcxLjItMTEuMyAxOS44LTUwLjggODItNTAuOCA4MmwzMi45IDI1LjJWNDQwSDM0OHYtNTJoMjA1LjZ2LTQ0SDM0OHYtNTJoMTMwLjVWMjI1LjZjMC00LjQgMy42LTggOC04aDU1LjZjNC40IDAgOCAzLjYgOCA4VjI5MmgxMzEuMnY1MmgtMTMxLjJ2NDRIMTMwLjZ2MFYyOTJIMjYwVjIyNS42YzAtNC40IDMuNi04IDgtOGg1Ni43YzAuMSAwIDAuMyAwIDAuNCAwIDQuNSAwIDguMSAzLjYgOC4xIDguMXYxMTYuMmgyOC4yaDAuOXY1Mkg3NjEuOXYxNzkuNmMtMzcuMiA0LjktNzIuMSA3LjQtMTA0IDcuNHY0My4xYzM4LjUgMCA4MC42LTMuMyAxMjYuOC0xMC41IDI5MS43LTQ1LjYgMzU4LjYtMTE4LjUgMzU4LjYtMTE4LjV2Njl2OTEuOGMwIDQyLjMtOC44IDgyLjUtMjQuOSAxMTguOXM0OC4xLTQ0LjUgNDguMS00NC41di0yMC4xYzIgMCAzLjkgMC41IDUuNiAxLjNDOTM3LjIgNjQyLjEgOTQ5LjQgNTc4LjggOTQ5LjQgNTEyeiIgZmlsbD0iIzEyOTZEQiIgcC1pZD0iMjYxNSI+PC9wYXRoPjwvc3ZnPg==');
}

.method-name {
  font-size: 14px;
  color: #333;
}

.pay-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 30px;
}

.pay-tips {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
}

.pay-tips p {
  margin-bottom: 10px;
}

.pay-tips ul {
  margin-left: 20px;
}

.pay-tips li {
  margin-bottom: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pay-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .countdown {
    margin-top: 10px;
  }
  
  .methods-container {
    flex-direction: column;
  }
  
  .method-item {
    width: 100%;
  }
  
  .pay-actions {
    flex-direction: column;
  }
  
  .pay-actions .el-button {
    width: 100%;
  }
}
</style>
