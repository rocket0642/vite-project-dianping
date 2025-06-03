<script setup>
import { Clock, Plus, UploadFilled } from '@element-plus/icons-vue'
import { ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElRadio, ElRadioGroup, ElSelect, ElUpload } from 'element-plus'
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
const orderId = route.params.id
// 状态变量
const loading = ref(false)
const submitting = ref(false)
const orderDetail = ref(null)
const showImageError = ref(false) // 是否显示图片错误提示

// 图片上传相关
const imageFiles = ref([]) // 保存文件对象
const previewImages = ref([]) // 保存预览图片URL

// 售后表单数据
const afterSaleForm = reactive({
  orderId: orderId,
  type: 1, // 默认退款退货
  reason: '', // 申请原因
  amount: 0, // 退款金额
  description: '', // 问题描述
  images: [], // 问题图片(最终上传后的URL)
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
  { value: 1, label: '退货退款' },
  { value: 2, label: '换货' },
  { value: 3, label: '维修' },
  { value: 4, label: '仅退款' }
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

/**
 * 处理图片添加
 */
const handleImageAdd = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件!')
      continue
    }

    // 检查文件大小
    if (file.size / 1024 / 1024 > 2) {
      ElMessage.error('图片大小不能超过 2MB!')
      continue
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)

    // 添加到预览列表和文件列表
    previewImages.value.push({
      url: previewUrl,
      name: file.name,
      uid: Date.now() + i // 生成唯一ID
    })

    imageFiles.value.push({
      file,
      uid: Date.now() + i
    })
  }

  // 如果有图片了，清除错误提示
  if (imageFiles.value.length > 0) {
    showImageError.value = false
  }

  // 清空input，允许选择相同文件
  e.target.value = ''
}

/**
 * 移除图片
 */
const removeImage = (index) => {
  // 如果有预览URL，释放内存
  if (previewImages.value[index]?.url) {
    URL.revokeObjectURL(previewImages.value[index].url)
  }

  // 从列表中移除
  previewImages.value.splice(index, 1)
  imageFiles.value.splice(index, 1)

  // 如果没有图片了，显示错误提示
  if (imageFiles.value.length === 0) {
    showImageError.value = true
  }

  ElMessage.success('图片已移除')
}

/**
 * 图片预览
 */
const previewUrl = ref('')
const previewVisible = ref(false)

const previewImage = (url) => {
  previewUrl.value = url
  previewVisible.value = true
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

// 上传所有图片
const uploadAllImages = async () => {
  if (imageFiles.value.length === 0) return true

  try {
    // 上传所有图片
    for (const imageItem of imageFiles.value) {
      const formData = new FormData()
      formData.append('file', imageItem.file)
      formData.append('type', 'afterSale')

      const res = await userStore.uploadUserSave(formData)
      if (res.success) {
        // 添加上传成功的图片URL到表单
        afterSaleForm.images.push(res.data)
      } else {
        ElMessage.error(`图片"${imageItem.file.name}"上传失败：${res.message || '未知错误'}`)
        return false
      }
    }
    return true
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
    return false
  }
}

// 提交售后申请
const submitAfterSale = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    // 检查是否上传了至少一张图片
    if (imageFiles.value.length === 0) {
      showImageError.value = true
      ElMessage.warning('请至少上传一张问题图片')
      return
    }

    // 开始提交
    submitting.value = true

    // 先上传所有图片
    if (imageFiles.value.length > 0) {
      const uploadSuccess = await uploadAllImages()
      if (!uploadSuccess) {
        submitting.value = false
        return
      }
    }

    // 转换金额为分
    const submitData = {
      ...afterSaleForm,
      amount: Math.round(afterSaleForm.amount * 100)
    }

    // 调用售后申请接口
    const id = await afterSaleStore.submitAfterSale(submitData)
    if (id) {
      ElMessage.success('售后申请提交成功')
      // 跳转到售后详情页
      router.push(`/order/after-sale-detail/${id}`)
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
          <el-form-item v-if="afterSaleForm.type === 1 || afterSaleForm.type === 4" label="退款金额" prop="amount">
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
            <el-input v-model="afterSaleForm.description" type="textarea" :rows="4" placeholder="请详细描述您遇到的问题，至少10个字符"
              maxlength="200" show-word-limit />
            <div class="form-tip">
              <el-icon>
                <Clock />
              </el-icon>
              <span>问题描述至少需要10个字符</span>
            </div>
          </el-form-item>

          <!-- 问题图片上传 -->
          <el-form-item label="问题图片" :class="{ 'is-error': showImageError }">
            <div class="image-upload-container">
              <!-- 图片预览列表 -->
              <div class="image-preview-list">
                <div v-for="(image, index) in previewImages" :key="index" class="image-preview-item">
                  <img :src="image.url" alt="问题图片" @click="previewImage(image.url)">
                  <div class="image-actions">
                    <button type="button" class="preview-btn" @click="previewImage(image.url)">
                      <i class="el-icon-zoom-in"></i>
                    </button>
                    <button type="button" class="remove-btn" @click="removeImage(index)">
                      <i class="el-icon-delete"></i>
                    </button>
                  </div>
                </div>

                <!-- 上传按钮 -->
                <div class="image-upload-btn" v-if="previewImages.length < 6">
                  <input type="file" accept="image/*" multiple @change="handleImageAdd" class="file-input">
                  <div class="upload-icon-container">
                    <el-icon class="upload-icon">
                      <Plus />
                    </el-icon>
                    <span>上传图片</span>
                  </div>
                </div>
              </div>

              <!-- 上传提示 -->
              <div class="upload-tip" :class="{ 'error-tip': showImageError }">
                <el-icon>
                  <UploadFilled />
                </el-icon>
                <span>请至少上传一张图片，可上传jpg/png图片，单个不超过2MB，最多6张</span>
              </div>
              <div v-if="showImageError" class="error-message">请至少上传一张图片</div>
            </div>

            <!-- 大图预览 -->
            <div v-if="previewVisible" class="image-preview-overlay" @click="previewVisible = false">
              <div class="image-preview-content" @click.stop>
                <img :src="previewUrl" alt="预览图片">
                <div class="image-preview-close" @click="previewVisible = false">×</div>
              </div>
            </div>
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
  margin-top: 10px;
}

.upload-tip .el-icon,
.form-tip .el-icon {
  margin-right: 5px;
}

/* 错误提示样式 */
.error-tip {
  color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1;
}

.is-error .el-form-item__label {
  color: #f56c6c;
}

/* 表单项样式 */
.el-form-item.is-error .image-upload-btn {
  border-color: #f56c6c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 15px;
}

/* 图片上传相关样式 */
.image-upload-container {
  margin-bottom: 10px;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.image-preview-item {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e0e0e0;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-preview-item:hover img {
  transform: scale(1.05);
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-item:hover .image-actions {
  opacity: 1;
}

.preview-btn,
.remove-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.7);
  margin: 0 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
}

.preview-btn:hover,
.remove-btn:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.remove-btn:hover {
  color: #f56c6c;
}

.image-upload-btn {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.image-upload-btn:hover {
  border-color: #409EFF;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.upload-icon-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

/* 大图预览 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.image-preview-close {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
}

.image-preview-close:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
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

  .image-preview-item,
  .image-upload-btn {
    width: 80px;
    height: 80px;
  }

  .image-preview-list {
    gap: 8px;
  }
}
</style>
