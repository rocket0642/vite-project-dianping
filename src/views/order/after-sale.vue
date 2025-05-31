<script setup>
import { ElButton, ElMessage, ElUpload } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const order = ref({})
const orderId = route.params.id

// 售后申请表单
const refundForm = ref({
  reason: '',
  amount: 0,
  description: '',
  images: []
})

// 售后原因选项
const refundReasons = [
  { value: '质量问题', label: '商品质量问题' },
  { value: '商品损坏', label: '商品损坏或污渍' },
  { value: '商品不符', label: '商品与描述不符' },
  { value: '多买/不想要', label: '买多了/不想要了' },
  { value: '其他', label: '其他原因' }
]

/**
 * 格式化价格
 * @param {number} price - 价格（单位：分）
 * @returns {string} - 格式化后的价格
 */
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00';
  return (price / 100).toFixed(2);
}

/**
 * 加载订单详情
 */
const loadOrderDetail = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder
    // 初始化退款金额为订单总金额
    refundForm.value.amount = order.value.amount / 100
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 图片上传前的处理
 */
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

/**
 * 图片上传成功的处理
 */
const handleUploadSuccess = (res) => {
  refundForm.value.images.push(res.url)
}

/**
 * 图片上传失败的处理
 */
const handleUploadError = () => {
  ElMessage.error('图片上传失败，请重试')
}

/**
 * 移除已上传的图片
 */
const handleRemove = (file) => {
  const index = refundForm.value.images.indexOf(file.url)
  if (index !== -1) {
    refundForm.value.images.splice(index, 1)
  }
}

/**
 * 提交退款申请
 */
const submitRefund = async () => {
  if (!refundForm.value.reason) {
    ElMessage.warning('请选择退款原因')
    return
  }

  if (refundForm.value.amount <= 0 || refundForm.value.amount > order.value.amount / 100) {
    ElMessage.warning(`退款金额必须大于0且不能超过订单金额${formatPrice(order.value.amount)}元`)
    return
  }

  submitting.value = true
  try {
    // 构建售后申请数据
    const refundData = {
      orderId: orderId,
      reason: refundForm.value.reason,
      amount: refundForm.value.amount * 100, // 转换为分
      description: refundForm.value.description,
      images: refundForm.value.images
    }

    // 提交售后申请并取消订单
    const res = await orderStore.cancelUserOrder({
      orderId,
      cancelReason: `售后申请：${JSON.stringify(refundData)}`,
    })

    if (res.success) {
      ElMessage.success('售后申请已提交，订单已取消')
      router.push(`/order/detail/${orderId}`)
    } else {
      ElMessage.error(res.errorMsg || '售后申请提交失败')
    }
  } catch (error) {
    console.error('提交售后申请失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/after-sale/' + orderId)
    return
  }

  loadOrderDetail()
})
</script>

<template>
  <AppLayout>
    <div class="after-sale-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载订单信息...</p>
      </div>

      <template v-else>
        <div class="page-header">
          <h1>申请售后</h1>
          <el-button @click="router.back()">返回</el-button>
        </div>

        <!-- 订单信息 -->
        <div class="order-info">
          <!-- 多个商品情况：遍历显示items数组 -->
          <template v-if="order.items && order.items.length">
            <div v-for="(item, index) in order.items" :key="index" class="order-item">
              <div class="goods-info">
                <div class="goods-name">{{ item.goodsName }}</div>
                <div class="goods-quantity">x{{ item.count }}</div>
                <div class="goods-price">¥{{ formatPrice(item.price) }}</div>
              </div>
              <div v-if="index === 0" class="order-amount">
                <div>订单号：{{ order.id }}</div>
                <div>订单金额：¥{{ formatPrice(order.amount) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- 退款表单 -->
        <div class="refund-form">
          <div class="form-item">
            <label>退款原因：</label>
            <el-select v-model="refundForm.reason" placeholder="请选择退款原因">
              <el-option v-for="item in refundReasons" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>

          <div class="form-item">
            <label>退款金额：</label>
            <el-input v-model.number="refundForm.amount" type="number" placeholder="请输入退款金额" :min="0"
              :max="order.amount / 100" style="width: 200px;" />
            <span class="amount-tip">元（最多{{ formatPrice(order.amount) }}元）</span>
          </div>

          <div class="form-item">
            <label>问题描述：</label>
            <el-input v-model="refundForm.description" type="textarea" placeholder="请详细描述问题" :rows="4" maxlength="500"
              show-word-limit />
          </div>

          <div class="form-item">
            <label>上传凭证：</label>
            <div class="upload-area">
              <el-upload action="/api/upload" list-type="picture-card" :before-upload="beforeUpload"
                :on-success="handleUploadSuccess" :on-error="handleUploadError" :on-remove="handleRemove" multiple
                :limit="5">
                <div class="upload-icon">+</div>
                <div class="upload-text">上传图片</div>
              </el-upload>
              <div class="upload-tip">最多上传5张图片，每张不超过2MB</div>
            </div>
          </div>

          <div class="form-action">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitRefund">
              提交申请
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.after-sale-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.order-info {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
}

.goods-info {
  display: flex;
  align-items: center;
}

.goods-name {
  font-weight: bold;
  margin-right: 15px;
}

.goods-quantity {
  color: #666;
  margin-right: 15px;
}

.goods-price {
  color: #f60;
}

.order-amount {
  text-align: right;
  color: #666;
}

.refund-form {
  margin-top: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}

.amount-tip {
  margin-left: 10px;
  color: #999;
}

.upload-area {
  margin-top: 10px;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  color: #8c939d;
  font-size: 12px;
  margin-top: 5px;
}

.upload-tip {
  color: #999;
  font-size: 12px;
  margin-top: 10px;
}

.form-action {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
</style>
