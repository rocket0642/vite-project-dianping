<script setup>
import { ElButton, ElMessage, ElUpload } from 'element-plus'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { submitAfterSale, uploadImage, } from '@/api/afterSale'
import { Plus } from '@element-plus/icons-vue'

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
  type: 1, // 默认为退款类型
  reason: '',
  amount: 0,
  description: '',
  images: [] // 确保初始化为空数组
})

// 售后原因选项
const refundReasons = [
  { value: '质量问题', label: '商品质量问题' },
  { value: '商品损坏', label: '商品损坏或污渍' },
  { value: '商品不符', label: '商品与描述不符' },
  { value: '多买/不想要', label: '买多了/不想要了' },
  { value: '其他', label: '其他原因' }
]

// 售后类型选项
const afterSaleTypes = [
  { value: 1, label: '仅退款' },
  { value: 2, label: '退货退款' }
]

// 使用 computed 确保 token 更新时 headers 也更新
const uploadHeaders = computed(() => {
  if (!userStore.isLogin) {
    return {}
  }
  // 确保 token 格式正确，添加 Bearer 前缀（如果后端需要）
  return {
    'Authorization': `Bearer ${userStore.token}`
  }
})

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

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择售后类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请选择退款原因', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请描述问题', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在10到500个字符之间', trigger: 'blur' }
  ]
}

// 修改上传组件的配置
const uploadRef = ref(null)

// 修改登录状态检查函数
const checkLoginStatus = () => {
  // 添加更详细的判断
  if (!userStore.token || !userStore.userInfo || !userStore.userInfo.id) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: `/order/after-sale/${orderId}` }
    })
    return false
  }
  return true
}

// 修改 onMounted 中的登录检查
onMounted(async () => {
  if (!checkLoginStatus()) return
  await loadOrderDetail()
})

// 修改 submitRefund 函数中的登录检查
const submitRefund = async () => {
  if (!checkLoginStatus()) return

  // 表单验证
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
    const success = await orderStore.submitAfterSaleApplication({
      orderId: orderId,
      userId: userStore.userInfo.id,
      shopId: order.value.shopId,
      type: refundForm.value.type,
      reason: refundForm.value.reason,
      amount: Math.floor(refundForm.value.amount * 100),
      description: refundForm.value.description || '',
      images: refundForm.value.images || [],
    })

    if (success) {
      ElMessage.success('售后申请提交成功')
      // 跳转到售后列表页面
      router.push('/order/list?status=6')
    }
  } catch (error) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 上传前的处理
const beforeUpload = (file) => {
  if (!checkLoginStatus()) return false

  // 打印请求头信息，用于调试
  console.log('Upload Headers:', uploadHeaders.value)

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

  // 检查图片数量限制
  if (refundForm.value.images.length >= 5) {
    ElMessage.error('最多只能上传5张图片!')
    return false
  }

  return true
}

// 上传成功的处理
const handleUploadSuccess = (response) => {
  console.log('Upload Success:', response)
  if (response.success) {
    // 确保 images 是数组
    if (!refundForm.value.images) {
      refundForm.value.images = []
    }
    refundForm.value.images.push(response.data)
    console.log('当前图片数组:', refundForm.value.images) // 调试用
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

// 上传失败的处理
const handleUploadError = (error) => {
  console.error('Upload Error:', error)
  ElMessage.error('图片上传失败，请重试')
}

/**
 * 移除已上传的图片
 */
const handleRemove = (uploadFile) => {
  console.log('移除的文件:', uploadFile) // 调试用
  const fileUrl = uploadFile.response?.data
  if (fileUrl) {
    const index = refundForm.value.images.indexOf(fileUrl)
    if (index !== -1) {
      refundForm.value.images.splice(index, 1)
      console.log('移除后的图片数组:', refundForm.value.images) // 调试用
    }
  }
}
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
          <el-form 
            ref="refundFormRef" 
            :model="refundForm"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="售后类型" prop="type">
              <el-select 
                v-model="refundForm.type" 
                placeholder="请选择售后类型"
                style="width: 100%"
              >
                <el-option 
                  v-for="item in afterSaleTypes" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="退款原因" prop="reason">
              <el-select 
                v-model="refundForm.reason" 
                placeholder="请选择退款原因"
                style="width: 100%"
              >
                <el-option 
                  v-for="item in refundReasons" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="退款金额" prop="amount">
              <el-input-number 
                v-model="refundForm.amount"
                :min="0.01"
                :max="order.amount / 100"
                :precision="2"
                :step="0.01"
                style="width: 200px"
              />
              <span class="amount-tip">元（最多{{ formatPrice(order.amount) }}元）</span>
            </el-form-item>

            <el-form-item label="问题描述" prop="description">
              <el-input
                v-model="refundForm.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述问题（至少10个字符）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="上传凭证">
              <div class="upload-container">
                <el-upload
                  action= "/api/after-sale/upload"
                  list-type="picture-card"
                  :headers="uploadHeaders"
                  :before-upload="beforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :on-remove="handleRemove"
                  multiple
                  :limit="5"
                  accept=".jpg,.jpeg,.png"
                  name="file"
                  ref="uploadRef"
                  class="upload-area"
                  :with-credentials="true"
                >
                  <el-icon><Plus /></el-icon>
                  <div class="el-upload__text">
                    点击上传图片
                    <div class="upload-tip">最多5张，每张不超过2MB</div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button @click="router.back()">取消</el-button>
              <el-button 
                type="primary" 
                :loading="submitting"
                @click="submitRefund"
              >
                提交申请
              </el-button>
            </el-form-item>
          </el-form>
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

.upload-container {
  width: 100%;
  max-width: 800px; /* 设置最大宽度 */
}

.upload-area {
  /* 确保上传组件在容器内部 */
  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    margin: 0 8px 8px 0;
  }

  :deep(.el-upload-list--picture-card) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 148px;
    height: 148px;
    margin: 0;
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 确保预览图片不会溢出 */
:deep(.el-image-viewer__wrapper) {
  img {
    max-width: 100%;
    max-height: 100%;
  }
}

.form-action {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.upload-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.preview-item {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-item .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
