<template>
  <div class="order-management">
    <h2 class="page-title">订单管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.orderNo"
        placeholder="订单号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-input
        v-model="queryParams.userName"
        placeholder="用户名/手机号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="queryParams.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        class="filter-item"
        style="width: 260px"
      />
      <el-button type="primary" class="filter-item" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" class="filter-item" @click="exportOrders">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
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
          ¥{{ row.totalAmount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPaymentStatusType(row.paymentStatus)">
            {{ getPaymentStatusText(row.paymentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getOrderStatusType(row.status)">
            {{ getOrderStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" align="center" />
      <el-table-column prop="payTime" label="支付时间" width="180" align="center" />
      <el-table-column label="操作" width="280" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
          <el-button 
            v-if="row.status === 1 && row.paymentStatus === 1" 
            type="success" 
            size="small" 
            @click="handleShip(row)"
          >
            发货
          </el-button>
          <el-button 
            v-if="row.status === 0 || (row.status === 1 && row.paymentStatus === 0)" 
            type="danger" 
            size="small" 
            @click="handleCancel(row)"
          >
            取消
          </el-button>
          <el-button 
            v-if="row.status === 4" 
            type="warning" 
            size="small" 
            @click="handleRefund(row)"
          >
            退款
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.currentPage"
        v-model:page-size="queryParams.pageSize"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  orderNo: '',
  userName: '',
  status: '',
  dateRange: [],
  currentPage: 1,
  pageSize: 10
})

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
  { label: '已退款', value: 5 }
]

// 支付状态
const paymentStatusMap = {
  0: { text: '未支付', type: 'info' },
  1: { text: '已支付', type: 'success' },
  2: { text: '已退款', type: 'warning' }
}

// 订单状态
const orderStatusMap = {
  0: { text: '待付款', type: 'info' },
  1: { text: '待发货', type: 'primary' },
  2: { text: '已发货', type: 'warning' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' },
  5: { text: '已退款', type: 'info' }
}

// 物流公司选项
const expressCompanyOptions = [
  { label: '顺丰速运', value: 'SF' },
  { label: '中通快递', value: 'ZTO' },
  { label: '圆通速递', value: 'YTO' },
  { label: '韵达快递', value: 'YD' },
  { label: '申通快递', value: 'STO' },
  { label: '京东物流', value: 'JD' }
]

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
const orderList = ref([
  { 
    id: 1, 
    orderNo: '20230101000001', 
    userName: '张三', 
    phone: '13800138001', 
    totalAmount: 128.50, 
    paymentStatus: 1, 
    status: 1, 
    createTime: '2023-01-01 10:30:25', 
    payTime: '2023-01-01 10:35:40'
  },
  { 
    id: 2, 
    orderNo: '20230101000002', 
    userName: '李四', 
    phone: '13800138002', 
    totalAmount: 256.00, 
    paymentStatus: 0, 
    status: 0, 
    createTime: '2023-01-01 11:20:15', 
    payTime: null
  },
  { 
    id: 3, 
    orderNo: '20230101000003', 
    userName: '王五', 
    phone: '13800138003', 
    totalAmount: 99.90, 
    paymentStatus: 1, 
    status: 2, 
    createTime: '2023-01-01 13:45:30', 
    payTime: '2023-01-01 13:50:20'
  },
  { 
    id: 4, 
    orderNo: '20230101000004', 
    userName: '赵六', 
    phone: '13800138004', 
    totalAmount: 399.00, 
    paymentStatus: 1, 
    status: 3, 
    createTime: '2023-01-01 15:10:45', 
    payTime: '2023-01-01 15:15:30'
  },
  { 
    id: 5, 
    orderNo: '20230101000005', 
    userName: '钱七', 
    phone: '13800138005', 
    totalAmount: 158.00, 
    paymentStatus: 2, 
    status: 5, 
    createTime: '2023-01-01 16:30:20', 
    payTime: '2023-01-01 16:35:10'
  }
])
const total = ref(5)

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

// 发货表单验证规则
const shipRules = {
  expressCompany: [
    { required: true, message: '请选择物流公司', trigger: 'change' }
  ],
  expressNo: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

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

// 退款表单验证规则
const refundRules = {
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请选择退款原因', trigger: 'change' }
  ]
}

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  return paymentStatusMap[status]?.text || '未知状态'
}

// 获取支付状态类型
const getPaymentStatusType = (status) => {
  return paymentStatusMap[status]?.type || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  return orderStatusMap[status]?.text || '未知状态'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  return orderStatusMap[status]?.type || 'info'
}

// 搜索
const handleSearch = () => {
  queryParams.currentPage = 1
  fetchOrderList()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchOrderList()
}

const handleCurrentChange = (page) => {
  queryParams.currentPage = page
  fetchOrderList()
}

// 获取订单列表
const fetchOrderList = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 查看订单详情
const handleDetail = (row) => {
  router.push(`/admin/orders/detail/${row.id}`)
}

// 发货
const handleShip = (row) => {
  shipDialogVisible.value = true
  shipForm.orderId = row.id
  shipForm.orderNo = row.orderNo
  shipForm.expressCompany = ''
  shipForm.expressNo = ''
  shipForm.remark = ''
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

// 提交退款表单
const submitRefundForm = async () => {
  if (!refundFormRef.value) return
  
  try {
    await refundFormRef.value.validate()
    
    // 模拟退款操作
    ElMessage.success(`订单 ${refundForm.orderNo} 退款成功`)
    refundDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 导出订单
const exportOrders = () => {
  ElMessage.success('订单数据导出成功')
}

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