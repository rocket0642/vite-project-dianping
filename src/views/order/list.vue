<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElTag, ElPagination, ElEmpty } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 路由实例
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeStatus = ref('0') // 0-全部，1-未支付，2-已支付，3-已取消，4-已完成

// 订单状态选项
const orderStatuses = [
  { value: '0', label: '全部' },
  { value: '1', label: '待付款' },
  { value: '2', label: '已支付' },
  { value: '3', label: '已取消' },
  { value: '4', label: '已完成' }
]

// 订单列表
const orderList = ref([])

/**
 * 获取订单状态对应的标签类型
 * @param {number} status - 订单状态
 * @returns {string} - 标签类型
 */
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'info'
    case 4: return 'primary'
    default: return 'info'
  }
}

/**
 * 获取订单状态文本
 * @param {number} status - 订单状态
 * @returns {string} - 状态文本
 */
const getStatusText = (status) => {
  switch (status) {
    case 1: return '待付款'
    case 2: return '已支付'
    case 3: return '已取消'
    case 4: return '已完成'
    default: return '未知状态'
  }
}

/**
 * 获取支付方式文本
 * @param {number} payType - 支付方式
 * @returns {string} - 支付方式文本
 */
const getPayTypeText = (payType) => {
  switch (payType) {
    case 1: return '微信支付'
    case 2: return '支付宝'
    default: return '未支付'
  }
}

/**
 * 格式化价格
 * @param {number} price - 价格（单位：分）
 * @returns {string} - 格式化后的价格
 */
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

/**
 * 加载订单列表
 */
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      status: activeStatus.value === '0' ? '' : parseInt(activeStatus.value),
      current: currentPage.value
    }
    
    const result = await orderStore.fetchOrderList(params)
    orderList.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 切换订单状态筛选
 * @param {string} status - 订单状态
 */
const changeStatus = (status) => {
  activeStatus.value = status
  currentPage.value = 1
  loadOrders()
}

/**
 * 页码变更处理
 * @param {number} page - 新页码
 */
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadOrders()
}

/**
 * 查看订单详情
 * @param {number} orderId - 订单ID
 */
const viewOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

/**
 * 去支付订单
 * @param {number} orderId - 订单ID
 */
const goToPay = (orderId) => {
  router.push(`/order/pay/${orderId}`)
}

/**
 * 取消订单
 * @param {number} orderId - 订单ID
 */
const cancelOrder = (orderId) => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await orderStore.cancelUserOrder(orderId)
        if (res.success) {
          ElMessage.success('订单已取消')
          loadOrders()
        } else {
          ElMessage.error(res.errorMsg || '取消订单失败')
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请稍后重试')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 初始化
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/list')
    return
  }
  
  loadOrders()
})
</script>

<template>
  <AppLayout>
    <div class="order-list-container">
      <div class="page-header">
        <h1>我的订单</h1>
      </div>
      
      <!-- 订单状态筛选 -->
      <div class="status-filter">
        <div 
          v-for="status in orderStatuses" 
          :key="status.value" 
          :class="['status-item', { active: activeStatus === status.value }]"
          @click="changeStatus(status.value)"
        >
          {{ status.label }}
        </div>
      </div>
      
      <!-- 订单列表 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载订单数据...</p>
      </div>
      
      <el-empty v-else-if="orderList.length === 0" description="暂无订单信息" />
      
      <div v-else class="order-list">
        <div 
          v-for="order in orderList" 
          :key="order.id" 
          class="order-item"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号: {{ order.id }}</span>
              <span class="order-time">下单时间: {{ order.createTime }}</span>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="order-content" @click="viewOrderDetail(order.id)">
            <div class="goods-info">
              <div class="goods-name">{{ order.goodsName }}</div>
              <div class="goods-quantity">x{{ order.count }}</div>
              <div class="goods-price">¥{{ formatPrice(order.goodsPrice) }}</div>
            </div>
            
            <div class="order-amount">
              <div class="amount-text">订单金额</div>
              <div class="amount-value">¥{{ formatPrice(order.amount) }}</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div v-if="order.payTime" class="pay-info">
              支付方式: {{ getPayTypeText(order.payType) }}
              <span v-if="order.payTime">, 支付时间: {{ order.payTime }}</span>
            </div>
            
            <div class="order-actions">
              <el-button 
                v-if="order.status === 1" 
                type="primary" 
                size="small"
                @click="goToPay(order.id)"
              >
                去支付
              </el-button>
              
              <el-button 
                v-if="order.status === 1" 
                type="default" 
                size="small"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </el-button>
              
              <el-button 
                type="text" 
                size="small"
                @click="viewOrderDetail(order.id)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-list-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 22px;
  color: #333;
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

.status-filter {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.status-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.status-item:hover {
  color: #409EFF;
}

.status-item.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

.order-list {
  margin-bottom: 20px;
}

.order-item {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-time {
  font-size: 14px;
  color: #666;
}

.order-content {
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.order-content:hover {
  background-color: #f9f9f9;
}

.goods-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.goods-name {
  flex: 1;
  font-weight: bold;
}

.goods-quantity {
  margin: 0 20px;
  color: #666;
}

.goods-price {
  font-weight: bold;
  color: #f60;
}

.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}

.amount-text {
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: bold;
  color: #f60;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
}

.pay-info {
  font-size: 14px;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-filter {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  
  .status-item {
    white-space: nowrap;
    padding: 10px 15px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-status {
    margin-top: 10px;
  }
  
  .goods-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .goods-name {
    margin-bottom: 5px;
  }
  
  .goods-quantity {
    margin: 5px 0;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pay-info {
    margin-bottom: 10px;
  }
  
  .order-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
