<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAfterSaleDetail, cancelAfterSale } from '../../api/afterSale'
import AppLayout from '../../components/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const afterSaleDetail = ref(null)

// 售后类型映射
const typeMap = {
  1: '仅退款',
  2: '退货退款'
}

// 售后状态映射
const statusMap = {
  1: { text: '待处理', class: 'pending' },
  2: { text: '处理中', class: 'processing' },
  3: { text: '已完成', class: 'completed' },
  4: { text: '已拒绝', class: 'rejected' }
}

// 格式化金额
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

// 格式化时间
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 获取售后详情
const fetchAfterSaleDetail = async () => {
  const afterSaleId = route.params.id
  if (!afterSaleId) {
    ElMessage.error('售后单号不存在')
    return
  }

  loading.value = true
  try {
    const res = await getAfterSaleDetail(afterSaleId)
    if (res.success) {
      afterSaleDetail.value = res.data
    } else {
      ElMessage.error(res.message || '获取售后详情失败')
    }
  } catch (error) {
    console.error('获取售后详情失败:', error)
    ElMessage.error('获取售后详情失败')
  } finally {
    loading.value = false
  }
}

// 取消售后申请
const handleCancel = async () => {
  try {
    const res = await cancelAfterSale(afterSaleDetail.value.id)
    if (res.success) {
      ElMessage.success('售后申请已取消')
      await fetchAfterSaleDetail()
    } else {
      ElMessage.error(res.message || '取消售后申请失败')
    }
  } catch (error) {
    console.error('取消售后申请失败:', error)
    ElMessage.error('取消售后申请失败')
  }
}

// 返回订单列表
const goBack = () => {
  router.push('/order/list?status=6')
}

onMounted(() => {
  fetchAfterSaleDetail()
})
</script>

<template>
  <AppLayout>
    <div class="after-sale-detail" v-loading="loading">
      <div class="page-header">
        <el-button type="text" icon="ArrowLeft" @click="goBack">返回售后列表</el-button>
        <h2>售后详情</h2>
      </div>

      <template v-if="afterSaleDetail">
        <div class="detail-card">
          <div class="card-header">
            <h3>基本信息</h3>
            <div class="status-tag" :class="statusMap[afterSaleDetail.status].class">
              {{ statusMap[afterSaleDetail.status].text }}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">售后单号：</span>
              <span class="value">{{ afterSaleDetail.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">关联订单：</span>
              <span class="value link" @click="router.push(`/order/detail/${afterSaleDetail.orderId}`)">
                {{ afterSaleDetail.orderId }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">申请时间：</span>
              <span class="value">{{ formatDate(afterSaleDetail.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">售后类型：</span>
              <span class="value">{{ typeMap[afterSaleDetail.type] }}</span>
            </div>
            <div class="info-item">
              <span class="label">退款金额：</span>
              <span class="value price">¥{{ formatPrice(afterSaleDetail.amount) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3>退款信息</h3>
          <div class="refund-info">
            <div class="info-item">
              <span class="label">退款原因：</span>
              <span class="value">{{ afterSaleDetail.reason }}</span>
            </div>
            <div class="info-item">
              <span class="label">问题描述：</span>
              <span class="value">{{ afterSaleDetail.description || '无' }}</span>
            </div>
            <div class="info-item" v-if="afterSaleDetail.images">
              <span class="label">图片凭证：</span>
              <div class="image-list">
                <el-image
                  v-for="(img, index) in afterSaleDetail.images.split(',')"
                  :key="index"
                  :src="img"
                  :preview-src-list="afterSaleDetail.images.split(',')"
                  fit="cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="detail-card" v-if="afterSaleDetail.handleMsg || afterSaleDetail.handleTime">
          <h3>处理信息</h3>
          <div class="handle-info">
            <div class="info-item" v-if="afterSaleDetail.handleMsg">
              <span class="label">处理备注：</span>
              <span class="value">{{ afterSaleDetail.handleMsg }}</span>
            </div>
            <div class="info-item" v-if="afterSaleDetail.handleTime">
              <span class="label">处理时间：</span>
              <span class="value">{{ formatDate(afterSaleDetail.handleTime) }}</span>
            </div>
          </div>
        </div>

        <div class="actions" v-if="afterSaleDetail.status === 1">
          <el-button type="danger" @click="handleCancel">取消申请</el-button>
        </div>
      </template>

      <el-empty v-else description="售后详情不存在" />
    </div>
  </AppLayout>
</template>

<style scoped>
.after-sale-detail {
  width: 80%;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.detail-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

.status-tag.pending {
  background-color: #e6a23c;
}

.status-tag.processing {
  background-color: #409eff;
}

.status-tag.completed {
  background-color: #67c23a;
}

.status-tag.rejected {
  background-color: #f56c6c;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.label {
  color: #606266;
  width: 100px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
}

.value.link {
  color: #409eff;
  cursor: pointer;
}

.value.link:hover {
  text-decoration: underline;
}

.value.price {
  color: #f56c6c;
  font-weight: bold;
}

.image-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.image-list .el-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.refund-info,
.handle-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 768px) {
  .after-sale-detail {
    width: 95%;
    padding: 10px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 