<script setup>
import { Clock, Plus, UploadFilled } from '@element-plus/icons-vue'
import { ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElRadio, ElRadioGroup, ElSelect, ElSelectOption, ElUpload } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const afterSaleStore = useAfterSaleStore()

// 获取订单ID
const orderId = Number(route.params.id)
// 状态变量
const loading = ref(false)
const submitting = ref(false)
const orderDetail = ref(null)

// 售后表单数据
const afterSaleForm = reactive({
  orderId: orderId,
  type: 1, // 默认退款
  reason: '', // 申请原因
  amount: 0, // 退款金额
  description: '', // 问题描述
  images: [] // 问题图片
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择售后类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请选择申请原因', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '金额必须大于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请填写问题描述', trigger: 'blur' },
    { min: 5, max: 200, message: '描述长度应在5到200个字符之间', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)

// 售后类型选项
const afterSaleTypes = [
  { value: 1, label: '仅退款' },
  { value: 2, label: '退货退款' },
  { value: 3, label: '换货' },
  { value: 4, label: '维修' }
]

// 售后原因选项
const afterSaleReasons = [
  '商品质量问题',
  '商品与描述不符',
  '收到商品破损',
  '商品缺货',
  '发货太慢',
  '商品性能故障',
  '不想要了',
  '其他原因'
]

// 图片上传相关
const fileList = ref([])
const uploadUrl = 'http://localhost:8080/api/upload' // 根据实际情况配置上传URL
const uploadHeaders = {
  Authorization: userStore.token ? `Bearer ${userStore.token}` : ''
}

// 图片上传前的校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 图片上传成功的处理
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    afterSaleForm.images.push(response.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 图片上传失败的处理
const handleUploadError = (err) => {
  console.error('上传失败:', err)
  ElMessage.error('图片上传失败，请重试')
}

// 移除图片
const handleRemove = (file, fileList) => {
  const index = afterSaleForm.images.findIndex(img => img === file.response?.data)
  if (index !== -1) {
    afterSaleForm.images.splice(index, 1)
  }
}

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    loading.value = true
    const detail = await orderStore.fetchOrderDetail(orderId)
    if (detail) {
      orderDetail.value = detail
      // 初始化退款金额为订单总金额
      afterSaleForm.amount = detail.amount
    } else {
      ElMessage.error('获取订单详情失败')
      router.push('/order/list')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 格式化价格 (分 -> 元)
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

// 提交售后申请
const submitAfterSale = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true
    // 转换金额为分
    const submitData = {
      ...afterSaleForm,
      amount: Math.round(afterSaleForm.amount * 100)
    }

    // 调用售后申请接口
    const result = await afterSaleStore.submitAfterSale(submitData)
    if (result && result.id) {
      ElMessage.success('售后申请提交成功')
      // 跳转到售后详情页
      router.push(`/order/after-sale-detail/${result.id}`)
    } else {
      ElMessage.error('售后申请提交失败')
    }
  } catch (error) {
    console.error('售后申请提交失败:', error)
    ElMessage.error('售后申请提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 返回订单列表
const goBack = () => {
  router.push('/order/list?status=6')
}

// 组件挂载时加载订单详情
onMounted(() => {
  loadOrderDetail()
})
</script>

<template>
  <AppLayout>
    <div class="after-sale-container" v-loading="loading">
      <div class="page-header">
        <h2 class="page-title">申请售后</h2>
        <el-button @click="goBack">返回列表</el-button>
      </div>

      <!-- 订单信息卡片 -->
      <div v-if="orderDetail" class="order-card">
        <div class="order-header">
          <h3>订单信息</h3>
          <span class="order-id">订单号：{{ orderDetail.id }}</span>
        </div>
        <div class="order-shop">
          <span class="shop-name">{{ orderDetail.shopName }}</span>
          <span class="order-time">下单时间：{{ orderDetail.createTime }}</span>
        </div>
        <div class="order-items">
          <div v-for="(item, index) in orderDetail.items" :key="index" class="order-item">
            <div class="item-image">
              <img :src="item.goodsImage?.[0]" alt="商品图片">
            </div>
            <div class="item-info">
              <h4 class="item-name">{{ item.goodsName }}</h4>
              <p class="item-spec">{{ item.skuName }}</p>
              <div class="item-price-count">
                <span class="item-price">¥{{ formatPrice(item.price) }}</span>
                <span class="item-count">x{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="order-total">
          <span>订单总金额：</span>
          <span class="total-amount">¥{{ formatPrice(orderDetail.amount) }}</span>
        </div>
      </div>

      <!-- 售后申请表单 -->
      <div class="form-card">
        <h3>售后信息</h3>

        <el-form ref="formRef" :model="afterSaleForm" :rules="rules" label-position="top" status-icon>
          <!-- 售后类型 -->
          <el-form-item label="售后类型" prop="type">
            <el-radio-group v-model="afterSaleForm.type">
              <el-radio v-for="type in afterSaleTypes" :key="type.value" :label="type.value">
                {{ type.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 申请原因 -->
          <el-form-item label="申请原因" prop="reason">
            <el-select v-model="afterSaleForm.reason" placeholder="请选择申请原因" style="width: 100%">
              <el-option v-for="(reason, index) in afterSaleReasons" :key="index" :label="reason" :value="reason" />
            </el-select>
          </el-form-item>

          <!-- 退款金额 (仅退款和退货退款时显示) -->
          <el-form-item v-if="afterSaleForm.type === 1 || afterSaleForm.type === 2" label="退款金额" prop="amount">
            <el-input-number v-model="afterSaleForm.amount" :min="0" :max="orderDetail?.amount / 100" :precision="2"
              :step="10" style="width: 100%" controls-position="right" />
            <div class="form-tip">
              <el-icon>
                <Clock />
              </el-icon>
              <span>退款金额不能超过订单总金额</span>
            </div>
          </el-form-item>

          <!-- 问题描述 -->
          <el-form-item label="问题描述" prop="description">
            <el-input v-model="afterSaleForm.description" type="textarea" :rows="4"
              placeholder="请详细描述您遇到的问题，以便我们更好地为您服务" maxlength="200" show-word-limit />
          </el-form-item>

          <!-- 问题图片 -->
          <el-form-item label="问题图片">
            <el-upload :action="uploadUrl" :headers="uploadHeaders" list-type="picture-card" :file-list="fileList"
              :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError"
              :on-remove="handleRemove" accept="image/*" multiple>
              <el-icon>
                <Plus />
              </el-icon>
              <template #tip>
                <div class="upload-tip">
                  <el-icon>
                    <UploadFilled />
                  </el-icon>
                  <span>可上传jpg/png图片，单个不超过2MB</span>
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="submitAfterSale" :loading="submitting">提交申请</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.after-sale-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 15px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.order-card,
.form-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.order-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.order-id {
  color: #606266;
}

.order-shop {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.shop-name {
  font-weight: 600;
  font-size: 16px;
}

.order-time {
  color: #909399;
}

.order-items {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.order-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 5px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.item-spec {
  margin: 0 0 5px;
  font-size: 12px;
  color: #909399;
}

.item-price-count {
  display: flex;
  justify-content: space-between;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
}

.item-count {
  color: #606266;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.total-amount {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
  margin-left: 10px;
}

.form-card h3 {
  margin-top: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
  font-size: 18px;
}

.upload-tip,
.form-tip {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.upload-tip .el-icon,
.form-tip .el-icon {
  margin-right: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 15px;
}

@media (max-width: 768px) {
  .after-sale-container {
    padding: 15px 10px;
  }

  .page-title {
    font-size: 18px;
  }

  .order-shop {
    flex-direction: column;
  }

  .shop-name {
    margin-bottom: 5px;
  }
}
</style>
