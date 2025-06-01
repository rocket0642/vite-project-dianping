<template>
  <div class="order-management">
    <h2 class="page-title">订单管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="订单号/用户名/手机号"
        style="width: 250px;"
        class="filter-item"
        @keyup.enter="handleSearch"
        clearable
      />
      <el-select 
        v-model="queryParams.status" 
        placeholder="订单状态" 
        clearable 
        style="width: 150px" 
        class="filter-item"
      >
        <el-option 
          v-for="item in orderStatusOptions" 
          :key="item.value" 
          :label="item.label" 
          :value="item.value" 
        />
      </el-select>
      <!-- <el-date-picker
        v-model="queryParams.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        class="filter-item"
        style="width: 260px"
      /> -->
      <el-button type="primary" class="filter-item" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <!-- <el-button type="success" class="filter-item" @click="exportOrders">
        <el-icon><Download /></el-icon>
        导出
      </el-button> -->
    </div>
    
    <!-- 订单列表 -->
    <el-table
      v-loading="loading"
      :data="orderList"
      border
      style="width: 100%"
    >
      <el-table-column prop="orderNo" label="订单号" min-width="180" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
        <template #default="{ row }">
          ¥{{ row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态">
        <template #default="{ row }">
          <el-tag :type="orderStatusTagType(row.orderStatus)">
            {{ orderStatusText(row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" align="center" />
      <el-table-column prop="payTime" label="支付时间" width="180" align="center" />
      <el-table-column label="操作" width="280" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
          <el-button 
            v-if="row.orderStatus === 2" 
            type="primary" 
            size="small" 
            @click="handleShip(row.id)"
            :loading="loading"
          >
            发货
          </el-button>
          <el-button 
            v-if="row.orderStatus === 1" 
            type="danger" 
            size="small" 
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 发货对话框 -->
    <el-dialog
      title="订单发货"
      v-model="shipDialogVisible"
      width="500px"
    >
      <el-form
        ref="shipFormRef"
        :model="shipForm"
        :rules="shipRules"
        label-width="100px"
      >
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流公司" prop="expressCompany">
          <el-select v-model="shipForm.expressCompany" placeholder="请选择物流公司" style="width: 100%">
            <el-option v-for="item in expressCompanyOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="shipForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShipForm">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 退款对话框 -->
    <el-dialog
      title="订单退款"
      v-model="refundDialogVisible"
      width="500px"
    >
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        :rules="refundRules"
        label-width="100px"
      >
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="refundForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="退款金额" prop="amount">
          <el-input-number v-model="refundForm.amount" :min="0" :precision="2" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%">
            <el-option v-for="item in refundReasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="refundForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRefundForm">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情弹窗 -->
    <el-dialog
      title="订单详情"
      v-model="detailDialogVisible"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="备注">
          <span>{{ detailData.remark }}</span>
        </el-form-item>
        <el-form-item label="收货地址">
          <span>{{ detailData.addressDetail }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getOrderPage } from '@/api/order'
import { Download, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const orderStore = useOrderStore()

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  keyword: '',  // 添加关键字搜索
  status: ''    // 订单状态筛选
})

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: 1 },
  { label: '待发货', value: 2 },
  { label: '已取消', value: 3 },
  { label: '待收货', value: 4 },
  { label: '已完成', value: 5 }
]

// 订单状态映射
const orderStatusMap = {
  1: { text: '待付款', type: 'info' },
  2: { text: '待发货', type: 'success' },
  3: { text: '已取消', type: 'danger' },
  4: { text: '待收货', type: 'primary' },
  5: { text: '已完成', type: 'warning' }
}


// 退款原因选项
const refundReasonOptions = [
  { label: '商品质量问题', value: '商品质量问题' },
  { label: '商品与描述不符', value: '商品与描述不符' },
  { label: '用户申请退款', value: '用户申请退款' },
  { label: '订单超时未发货', value: '订单超时未发货' },
  { label: '其他原因', value: '其他原因' }
]

// 表格数据
const loading = ref(false)
const orderList = ref([])
const total = ref(0)

// 发货对话框
const shipDialogVisible = ref(false)
const shipFormRef = ref(null)
const shipForm = reactive({
  orderId: '',
  orderNo: '',
  expressCompany: '',
  expressNo: '',
  remark: ''
})


// 退款对话框
const refundDialogVisible = ref(false)
const refundFormRef = ref(null)
const refundForm = reactive({
  orderId: '',
  orderNo: '',
  amount: 0,
  reason: '',
  remark: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const detailData = ref({
  remark: '',
  addressDetail: ''
})

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  return paymentStatusMap[status]?.text || '未知状态'
}

// 获取支付状态类型
const getPaymentStatusType = (status) => {
  return paymentStatusMap[status]?.type || 'info'
}

// 获取订单状态文本
const orderStatusText = (status) => orderStatusMap[status]?.text || '未知'

// 获取订单状态类型
const orderStatusTagType = (status) => orderStatusMap[status]?.type || 'info'

// 搜索
const handleSearch = () => {
  queryParams.page = 1  // 重置到第一页
  fetchOrderList()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.size = size
  fetchOrderList()
}

const handleCurrentChange = (page) => {
  queryParams.page = page
  fetchOrderList()
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await getOrderPage(queryParams)
    console.log('API返回数据:', res)
    
    if (res.data) {
      orderList.value = res.data.records.map(item => ({
        id: item.id,
        orderNo: item.id,
        userName: item.addressName,
        phone: item.addressPhone,
        totalAmount: (item.amount / 100).toFixed(2),
        orderStatus: item.status,
        createTime: item.createTime,
        payTime: item.payTime,
        remark: item.remark || '无',
        addressDetail: item.addressDetail || '无'
      }))
      total.value = res.data.total
    } else {
      orderList.value = []
      total.value = 0
      ElMessage.warning('暂无数据')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const handleDetail = (row) => {
  detailData.value = {
    remark: row.remark || '无',
    addressDetail: row.addressDetail || '无'
  }
  detailDialogVisible.value = true
}

// 发货
const handleShip = async (orderId) => {
  try {
    loading.value = true
    const res = await orderStore.shipUserOrder(orderId)
    if (res.success) {
      ElMessage.success('发货成功')
      // 刷新订单列表
      await orderStore.fetchOrderList()
    } else {
      ElMessage.error(res.errorMsg || '发货失败')
    }
  } catch (error) {
    console.error('发货操作失败:', error)
    ElMessage.error('发货失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 提交发货表单
const submitShipForm = async () => {
  if (!shipFormRef.value) return
  
  try {
    await shipFormRef.value.validate()
    
    // 模拟发货操作
    ElMessage.success(`订单 ${shipForm.orderNo} 发货成功`)
    shipDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消订单
const handleCancel = (row) => {
  ElMessageBox.confirm(`确定要取消订单 ${row.orderNo} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟取消订单操作
    ElMessage.success(`订单 ${row.orderNo} 已取消`)
    fetchOrderList()
  }).catch(() => {})
}

// 退款
const handleRefund = (row) => {
  refundDialogVisible.value = true
  refundForm.orderId = row.id
  refundForm.orderNo = row.orderNo
  refundForm.amount = row.totalAmount
  refundForm.reason = ''
  refundForm.remark = ''
}

// // 提交退款表单
// const submitRefundForm = async () => {
//   if (!refundFormRef.value) return
  
//   try {
//     await refundFormRef.value.validate()
    
//     // 模拟退款操作
//     ElMessage.success(`订单 ${refundForm.orderNo} 退款成功`)
//     refundDialogVisible.value = false
//     fetchOrderList()
//   } catch (error) {
//     console.error('表单验证失败:', error)
//   }
// }

// // 导出订单
// const exportOrders = () => {
//   ElMessage.success('订单数据导出成功')
// }

// 监听查询参数变化
watch(
  [() => queryParams.keyword, () => queryParams.status],
  () => {
    handleSearch()
  }
)

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-management {
  padding: 0 10px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  color: #303133;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>