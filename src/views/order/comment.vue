<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { getOrderDetail } from '../../api/order'
import AppLayout from '../../components/AppLayout.vue'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import { useCommentStore } from '../../stores/comment'
import { useOrderStore } from '../../stores/order'

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
  userId: 0,
  shopId: 0,
  orderId: orderId,
  goodsId: 0,
  goodsName: '',
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
    alreadyCommented.value = await commentStore.checkCommentDirectly(orderId);
    
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
    const res = await orderStore.fetchOrderDetail(orderId)
    order.value = res
    
    // 填充评价表单
    commentForm.value.userId = order.value.userId || userStore.userInfo.id
    commentForm.value.shopId = order.value.shopId
    commentForm.value.goodsId = order.value.goodsId
    commentForm.value.goodsName = order.value.goodsName
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
      goodsId: order.value.goodsId,
      goodsName: order.value.goodsName,
      content: commentForm.value.content,
      score: commentForm.value.score,
      images: commentForm.value.images,
      userPhone: userStore.userPhone // 关联用户电话
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
 * 返回订单详情页
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
            <el-button type="primary" @click="goBack">返回订单详情</el-button>
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
            <span class="label">商品:</span>
            <span>{{ order.goodsName }}</span>
          </div>
          <div class="info-item">
            <span class="label">数量:</span>
            <span>{{ order.count }}</span>
          </div>
          <div class="info-item">
            <span class="label">总价:</span>
            <span class="price">¥{{ (order.amount / 100).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="rate-section">
          <span class="rate-label">商品评分:</span>
          <el-rate
            v-model="commentForm.score"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :texts="['失望', '一般', '满意', '很满意', '非常满意']"
            show-text
          />
        </div>
        
        <div class="content-section">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价内容..."
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
  margin-bottom: 30px;
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

.rate-section,
.content-section,
.upload-section {
  margin-bottom: 20px;
}

.rate-label,
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
