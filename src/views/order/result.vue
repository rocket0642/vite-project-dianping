<template>
  <div class="order-result">
    <div class="result-card">
      <el-result
        :icon="status === 'success' ? 'success' : 'error'"
        :title="status === 'success' ? '支付成功' : '支付失败'"
        :sub-title="subTitle"
      >
        <template #extra>
          <div class="btn-group">
            <el-button type="primary" @click="$router.push('/order/list')">查看订单</el-button>
            <el-button @click="$router.push('/')">返回首页</el-button>
          </div>
        </template>
      </el-result>
      <div v-if="status === 'success'" class="order-info">
        <p>订单号: {{ orderId }}</p>
        <p>支付金额: ¥{{ amount }}</p>
        <p>支付方式: {{ paymentMethod }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const status = ref('success')
const subTitle = ref('您的订单已支付成功，感谢您的购买！')
const orderId = ref('')
const amount = ref(0)
const paymentMethod = ref('支付宝')

onMounted(() => {
  // 从路由参数获取支付结果信息
  if (route.query.status) {
    status.value = route.query.status
    if (status.value === 'success') {
      subTitle.value = '您的订单已支付成功，感谢您的购买！'
    } else {
      subTitle.value = '支付失败，请重新尝试或联系客服。'
    }
  }
  
  if (route.query.orderId) {
    orderId.value = route.query.orderId
  }
  
  if (route.query.amount) {
    amount.value = route.query.amount
  }
  
  if (route.query.paymentMethod) {
    paymentMethod.value = route.query.paymentMethod
  }
})
</script>

<style scoped lang="scss">
.order-result {
  padding: 30px 0;
  
  .result-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .btn-group {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .order-info {
    border-top: 1px solid #eee;
    margin-top: 20px;
    padding-top: 20px;
    
    p {
      line-height: 2;
      color: #666;
    }
  }
}
</style>
