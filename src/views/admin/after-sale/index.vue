<template>
  <div class="after-sale-management">
    <div class="header">
      <h2>售后管理</h2>
      <div class="filter">
        <el-select v-model="statusFilter" placeholder="售后状态" clearable @change="handleFilter" style="width: 150px">
          <el-option :label="'全部'" :value="null" />
          <el-option :label="'处理中'" :value="1" />
          <el-option :label="'已完成'" :value="2" />
          <el-option :label="'已拒绝'" :value="3" />
        </el-select>
      </div>
    </div>

    <el-card shadow="hover" class="list-card">
      <el-table v-loading="loading" :data="afterSaleList" style="width: 100%" border stripe :fit="true"
        empty-text="暂无售后数据" highlight-current-row>
        <el-table-column prop="id" label="售后ID" width="80" />
        <el-table-column prop="orderId" label="订单编号" min-width="180" show-overflow-tooltip />
        <el-table-column label="售后类型" width="120">
          <template #default="scope">
            {{ getAfterSaleTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="售后状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getAfterSaleStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请原因" min-width="120" show-overflow-tooltip />
        <el-table-column prop="description" label="问题描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="amount" label="退款金额" width="120">
          <template #default="scope">
            {{ (scope.row.amount / 100).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button type="primary" link @click="showDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background :current-page="currentPage" :page-size="pageSize" :total="total"
          layout="total, prev, pager, next" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="售后详情" width="700px" destroy-on-close :close-on-click-modal="false"
      :show-close="true" top="5vh">
      <div v-loading="detailLoading" v-if="currentDetail" class="detail-content">
        <div class="detail-header">
          <div class="detail-status">
            <el-tag :type="getStatusType(currentDetail.status)" size="large" effect="dark">
              {{ getAfterSaleStatusText(currentDetail.status) }}
            </el-tag>
          </div>
          <div class="detail-id">售后单号: {{ currentDetail.id }}</div>
        </div>

        <el-divider content-position="left">基本信息</el-divider>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentDetail.orderId }}</el-descriptions-item>
          <el-descriptions-item label="售后类型">{{ getAfterSaleTypeText(currentDetail.type) }}</el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ currentDetail.reason }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">{{ (currentDetail.amount / 100).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ currentDetail.createTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">问题详情</el-divider>

        <div class="problem-description">
          <div class="description-text">{{ currentDetail.description || '无详细描述' }}</div>
        </div>

        <div v-if="currentDetail.images && currentDetail.images.length" class="image-gallery">
          <el-divider content-position="left">问题图片</el-divider>
          <div class="image-container">
            <el-image v-for="(img, index) in currentDetail.images" :key="index" :src="img"
              :preview-src-list="currentDetail.images" fit="cover" class="detail-image" />
          </div>
        </div>

        <!-- 处理表单 -->
        <div v-if="currentDetail.status === 1" class="handle-form">
          <el-divider content-position="left">售后处理</el-divider>
          <el-form :model="handleForm" label-width="100px">
            <el-form-item label="处理结果">
              <el-radio-group v-model="handleForm.status">
                <el-radio :label="2">同意</el-radio>
                <el-radio :label="3">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="退款金额"
              v-if="handleForm.status === 2 && (currentDetail.type === 1 || currentDetail.type === 4)">
              <div class="amount-display">{{ (currentDetail.amount / 100).toFixed(2) }} 元</div>
            </el-form-item>
            <el-form-item label="处理备注">
              <el-input v-model="handleForm.handleMsg" type="textarea" rows="3" placeholder="请输入处理备注信息" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitHandleAfterSale" :loading="submitLoading"
                :disabled="submitLoading">提交处理</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="currentDetail.status !== 1" class="handled-result">
          <el-divider content-position="left">处理结果</el-divider>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="处理备注">{{ currentDetail.handleMsg || '无' }}</el-descriptions-item>
            <el-descriptions-item label="处理时间">{{ currentDetail.handleTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAfterSaleStore } from '../../../stores/afterSale'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const afterSaleStore = useAfterSaleStore()

// 列表数据
const afterSaleList = computed(() => afterSaleStore.afterSaleList)
const loading = computed(() => afterSaleStore.loading)
const currentPage = computed(() => afterSaleStore.listPageState.filter.current)
const pageSize = computed(() => afterSaleStore.listPageState.filter.pageSize)
const total = computed(() => afterSaleStore.listPageState.total)

// 筛选条件
const statusFilter = ref(afterSaleStore.listPageState.filter.status)
const orderIdFilter = ref(afterSaleStore.listPageState.filter.orderId)

// 详情相关
const detailVisible = ref(false)
const currentDetail = ref(null)
const submitLoading = ref(false)
const detailLoading = ref(false)

// 处理表单
const handleForm = ref({
  id: null,
  orderId: null,
  status: 2,
  type: null,
  handleMsg: '',
  amount: 0
})

// 加载售后列表
const fetchList = async () => {
  const params = {
    current: currentPage.value,
    size: pageSize.value,
    status: statusFilter.value,
    orderId: orderIdFilter.value
  }

  await afterSaleStore.fetchAfterSaleList(params)
}

// 处理筛选
const handleFilter = () => {
  afterSaleStore.listPageState.filter.current = 1
  afterSaleStore.listPageState.filter.status = statusFilter.value
  afterSaleStore.listPageState.filter.orderId = orderIdFilter.value
  fetchList() // 立即搜索
}

// 处理分页
const handlePageChange = (page) => {
  afterSaleStore.listPageState.filter.current = page
  fetchList()
}

// 查看详情
const showDetail = async (row) => {
  try {
    detailLoading.value = true
    const detail = await afterSaleStore.fetchAfterSaleDetail(row.id)
    if (detail) {
      currentDetail.value = detail
      handleForm.value = {
        id: detail.id,
        orderId: detail.orderId,
        status: 2,
        type: detail.type,
        handleMsg: '',
        amount: detail.amount // 直接使用后端返回的金额（分）
      }
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取售后详情失败:', error)
    ElMessage.error('获取售后详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 提交处理售后（添加防抖）
const submitHandleAfterSale = async () => {
  if (submitLoading.value) return; // 防止重复点击

  // 表单校验
  if (!handleForm.value.handleMsg) {
    ElMessage.warning('请输入处理备注')
    return
  }

  try {
    submitLoading.value = true

    // 确认处理
    const confirmMsg = handleForm.value.status === 2 ? '确定同意此售后申请？' : '确定拒绝此售后申请？'
    await ElMessageBox.confirm(confirmMsg, '确认操作')

    // 确保ID是数字类型，金额使用分为单位
    const submitData = {
      ...handleForm.value,
      id: Number(handleForm.value.id)
    }

    const result = await afterSaleStore.handleAdminAfterSale(submitData)
    if (result) {
      ElMessage.success('处理成功')
      detailVisible.value = false
      fetchList()
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('处理售后失败:', error)
    ElMessage.error(typeof error === 'string' ? error : '处理售后失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

// 获取状态文本
const getAfterSaleStatusText = (status) => {
  return afterSaleStore.getAfterSaleStatusText(status)
}

// 获取类型文本
const getAfterSaleTypeText = (type) => {
  return afterSaleStore.getAfterSaleTypeText(type)
}

// 获取状态样式
const getStatusType = (status) => {
  const typeMap = {
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 监听筛选状态变化
watch(() => statusFilter.value, (newVal) => {
  afterSaleStore.listPageState.filter.status = newVal
  fetchList() // 自动触发查询
})

// 监听订单ID变化
watch(() => orderIdFilter.value, (newVal) => {
  if (!newVal) {
    // 当清空订单ID时自动刷新
    afterSaleStore.listPageState.filter.orderId = null
    fetchList()
  }
})

// 页面加载时获取数据
onMounted(() => {
  // 初始化筛选条件，默认显示处理中的售后
  statusFilter.value = afterSaleStore.listPageState.filter.status // 使用状态管理中的默认值
  orderIdFilter.value = afterSaleStore.listPageState.filter.orderId
  fetchList()
})
</script>

<style scoped>
.after-sale-management {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.list-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.list-card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-card :deep(.el-table) {
  flex: 1;
}

.list-card :deep(.el-table__row) {
  transition: background-color 0.3s;
}

.list-card :deep(.el-tag) {
  transition: all 0.3s;
}

.list-card :deep(.el-table__row:hover) {
  background-color: #ecf5ff;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.detail-content {
  padding: 0 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-id {
  font-size: 14px;
  color: #666;
}

.problem-description {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
}

.description-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.image-gallery {
  margin-top: 20px;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.detail-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.detail-image:hover {
  transform: scale(1.05);
}

.handle-form {
  margin-top: 20px;
  padding-top: 10px;
}

.handled-result {
  margin-top: 20px;
  padding-top: 10px;
}

.amount-display {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
  padding: 5px 0;
}
</style>
