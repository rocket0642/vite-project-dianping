<script setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useCommentStore } from '../../stores/comment'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const orderId = parseInt(route.params.id)

// 状态
const loading = ref(false)
const submitting = ref(false)
const order = ref({})
const alreadyCommented = ref(false)

// 评价表单
const commentForm = ref({
  orderId: orderId,
  shopId: 0,
  content: '',
  score: 5,
  images: []
})

// 上传图片相关
const imageList = ref([])
const uploadUrl = 'https://mock-api.com/upload' // 模拟上传地址

// Store
const userStore = useUserStore()
const commentStore = useCommentStore()
const orderStore = useOrderStore()

/**
 * 格式化价格
 */
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00'
  return (price / 100).toFixed(2)
}

/**
 * 上传图片成功回调
 */
const handleUploadSuccess = (response) => {
  imageList.value.push(response.url)
  commentForm.value.images = imageList.value
}

/**
 * 删除已上传图片
 */
const handleRemoveImage = (file) => {
  const index = imageList.value.indexOf(file.url)
  if (index !== -1) {
    imageList.value.splice(index, 1)
    commentForm.value.images = imageList.value
  }
}

/**
 * 检查订单是否已评价
 */
const checkHasComment = async () => {
  try {
    // 使用store方法替代直接API调用
    alreadyCommented.value = await commentStore.checkIfOrderCommented(orderId);
    
    if (alreadyCommented.value) {
      ElMessage.warning('该订单已评价');
      setTimeout(() => {
        router.push('/order/list');
      }, 1500);
    }
  } catch (error) {
    console.error('检查订单评价状态失败:', error);
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
    
    // 填充评价表单
    commentForm.value.shopId = order.value.shopId
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * 提交评价
 */
const submitOrderComment = async () => {
  // 表单验证
  if (!commentForm.value.content) {
    ElMessage.warning('请填写评价内容')
    return
  }
  
  submitting.value = true
  try {
    // 提交前构建评价数据
    const commentData = {
      orderId: orderId,
      shopId: order.value.shopId,
      content: commentForm.value.content,
      score: commentForm.value.score,
      images: commentForm.value.images,
    }
    
    const res = await commentStore.submitUserComment(commentData)
    if (res.success) {
      // 立即刷新订单列表数据
      await orderStore.fetchOrderList()
      
      ElNotification({
        title: '评价成功',
        message: '感谢您的评价！',
        type: 'success'
      })
      
      // 跳转回订单列表页
      setTimeout(() => {
        router.push('/order/list')
      }, 1500)
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交评价失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 返回订单列表页
 */
const goBack = () => {
  router.push('/order/list')
}

// 页面初始化
onMounted(() => {
  checkHasComment()
  loadOrderDetail()
})
</script>

<template>
  <AppLayout>
    <div class="comment-container">
      <div class="comment-header">
        <h1>订单评价</h1>
        <el-button @click="goBack">返回</el-button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="alreadyCommented" class="already-commented">
        <el-result
          icon="warning"
          title="该订单已评价"
          sub-title="每个订单只能评价一次"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回订单列表</el-button>
          </template>
        </el-result>
      </div>
      
      <div v-else class="comment-form">
        <div class="order-info">
          <h2>订单信息</h2>
          <div class="info-item">
            <span class="label">订单号:</span>
            <span>{{ order.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">店铺:</span>
            <span>{{ order.shopName }}</span>
          </div>
          <div class="info-item">
            <span class="label">总价:</span>
            <span class="price">¥{{ formatPrice(order.amount) }}</span>
          </div>
        </div>
        
        <!-- 显示订单中的所有商品 -->
        <div class="goods-list">
          <h3>商品详情</h3>
          <div v-for="(item, index) in order.items" :key="index" class="goods-item">
            <div class="goods-image" v-if="item.goodsImage">
              <img :src="item.goodsImage" alt="商品图片" />
            </div>
            <div class="goods-details">
              <div class="goods-name">{{ item.goodsName }}</div>
              <div class="goods-sku" v-if="item.skuName">规格: {{ item.skuName }}</div>
              <div class="goods-price-count">
                <span class="price">¥{{ formatPrice(item.price) }}</span>
                <span class="count">x{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rate-section">
          <span class="rate-label">整体评分:</span>
          <el-rate
            v-model="commentForm.score"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :texts="['失望', '一般', '满意', '很满意', '非常满意']"
            show-text
          />
        </div>
        
        <div class="content-section">
          <span class="content-label">评价内容:</span>
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您对整个订单的评价内容..."
            maxlength="200"
            show-word-limit
          />
        </div>
        
        <div class="upload-section">
          <span class="upload-label">上传图片(可选):</span>
          <el-upload
            :action="uploadUrl"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemoveImage"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
        
        <div class="submit-section">
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitOrderComment"
          >
            提交评价
          </el-button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.comment-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header h1 {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.already-commented {
  padding: 30px 0;
}

.comment-form {
  padding: 20px 0;
}

.order-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.order-info h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.label {
  width: 80px;
  color: #666;
  font-weight: bold;
}

.price {
  color: #f60;
  font-weight: bold;
}

/* 商品列表样式 */
.goods-list {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.goods-list h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 15px;
}

.goods-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-details {
  flex: 1;
}

.goods-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.goods-sku {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.goods-price-count {
  display: flex;
  justify-content: space-between;
}

.count {
  color: #606266;
}

.rate-section,
.content-section,
.upload-section {
  margin-bottom: 20px;
}

.rate-label,
.content-label,
.upload-label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.submit-section {
  margin-top: 30px;
  text-align: center;
}
</style>
