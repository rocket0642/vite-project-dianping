<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useOrderStore } from '../../stores/order'

const route = useRoute()
const router = useRouter()
const afterSaleStore = useAfterSaleStore()
const orderStore = useOrderStore()

// 获取售后ID
const afterSaleId = parseInt(route.params.id)
const loading = ref(false)
const afterSale = ref(null)
const orderDetail = ref(null)

// 加载售后详情
const loadAfterSaleDetail = async () => {
  try {
    loading.value = true
    console.log('afterSaleId', afterSaleId)
    const data = await afterSaleStore.fetchAfterSaleDetail(afterSaleId)
    if (data) {
      afterSale.value = data
      // 加载关联的订单信息
      await loadOrderDetail(data.orderId)
    } else {
      ElMessage.error('获取售后详情失败')
      router.push('/order/list?status=6')
    }
  } catch (error) {
    console.error('获取售后详情失败:', error)
    ElMessage.error('获取售后详情失败，请稍后重试')
    router.push('/order/list?status=6')
  } finally {
    loading.value = false
  }
}

// 加载订单详情
const loadOrderDetail = async (orderId) => {
  try {
    const res = await orderStore.fetchOrderDetail(orderId)
    if (res) {
      orderDetail.value = res
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

// 获取售后状态文本
const getStatusText = (status) => {
  return afterSaleStore.getAfterSaleStatusText(status)
}

// 获取售后类型文本
const getTypeText = (type) => {
  return afterSaleStore.getAfterSaleTypeText(type)
}

// 格式化金额 (分 -> 元)
const formatAmount = (amount) => {
  return (amount / 100).toFixed(2)
}

// 组件挂载时加载详情
onMounted(() => {
  loadAfterSaleDetail()
})
</script>

<template>
  <AppLayout>
    <div class="after-sale-detail-container" v-loading="loading">
      <div class="page-header">
        <h2 class="page-title">售后详情</h2>
        <el-button @click="router.back()">返回</el-button>
      </div>

      <div v-if="afterSale" class="detail-content">
        <div class="detail-card">
          <h3>基本信息</h3>
          <div class="info-section">
            <div class="info-item">
              <span class="label">售后单号：</span>
              <span>{{ afterSale.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单号：</span>
              <span>{{ afterSale.orderId }}</span>
            </div>
            <div class="info-item">
              <span class="label">售后类型：</span>
              <span>{{ getTypeText(afterSale.type) }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请时间：</span>
              <span>{{ afterSale.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <span :class="['status', `status-${afterSale.status}`]">{{ getStatusText(afterSale.status) }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请原因：</span>
              <span>{{ afterSale.reason }}</span>
            </div>
            <div v-if="afterSale.type === 1 || afterSale.type === 2" class="info-item">
              <span class="label">退款金额：</span>
              <span class="amount">¥{{ formatAmount(afterSale.amount) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3>问题描述</h3>
          <div class="description">{{ afterSale.description }}</div>
        </div>

        <div v-if="afterSale.images && afterSale.images.length" class="detail-card">
          <h3>问题图片</h3>
          <div class="images-container">
            <div v-for="(img, index) in afterSale.images" :key="index" class="image-item">
              <el-image :src="img" :preview-src-list="afterSale.images" :initial-index="index" fit="cover" />
            </div>
          </div>
        </div>

        <div v-if="afterSale.status !== 1" class="detail-card">
          <h3>处理结果</h3>
          <div class="result-info">
            <div class="info-item">
              <span class="label">处理时间：</span>
              <span>{{ afterSale.handleTime || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">处理结果：</span>
              <span :class="['status', `status-${afterSale.status}`]">{{ getStatusText(afterSale.status) }}</span>
            </div>
            <div class="info-item">
              <span class="label">处理备注：</span>
              <span>{{ afterSale.handleMsg || '-' }}</span>
            </div>
          </div>
        </div>

        <div v-if="orderDetail" class="detail-card">
          <h3>关联订单信息</h3>
          <div class="order-info">
            <div class="info-item">
              <span class="label">商家名称：</span>
              <span>{{ orderDetail.shopName }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单金额：</span>
              <span>¥{{ formatAmount(orderDetail.amount) }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单状态：</span>
              <span>{{ orderDetail.status === 6 ? '售后处理中' : '已完成' }}</span>
            </div>
          </div>

          <h4>商品信息</h4>
          <div class="goods-list">
            <div v-for="(item, index) in orderDetail.items" :key="index" class="goods-item">
              <div class="goods-image">
                <img :src="item.goodsImage?.[0]" alt="商品图片">
              </div>
              <div class="goods-info">
                <h5>{{ item.goodsName }}</h5>
                <p>{{ item.skuName }}</p>
                <p>数量：{{ item.count }}</p>
              </div>
              <div class="goods-price">
                ¥{{ formatAmount(item.price * item.count) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="no-data">
        <el-empty description="未找到售后详情" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.after-sale-detail-container {
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

.detail-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.detail-card h3 {
  font-size: 18px;
  margin-top: 0;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.detail-card h4 {
  font-size: 16px;
  margin: 20px 0 15px;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.label {
  width: 100px;
  color: #606266;
  font-weight: 600;
}

.status {
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 13px;
}

.status-1 {
  background-color: #e6a23c;
}

.status-2 {
  background-color: #67c23a;
}

.status-3 {
  background-color: #f56c6c;
}

.amount {
  font-weight: bold;
  color: #f56c6c;
}

.description {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.image-item {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.image-item .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-list {
  margin-top: 15px;
}

.goods-item {
  display: flex;
  border-bottom: 1px dashed #ebeef5;
  padding: 15px 0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 70px;
  height: 70px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  flex: 1;
}

.goods-info h5 {
  margin: 0 0 5px;
  font-size: 15px;
}

.goods-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 13px;
}

.goods-price {
  width: 80px;
  text-align: right;
  font-weight: bold;
  color: #f56c6c;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .after-sale-detail-container {
    padding: 15px 10px;
  }

  .page-title {
    font-size: 18px;
  }

  .detail-card {
    padding: 15px;
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}
</style>
