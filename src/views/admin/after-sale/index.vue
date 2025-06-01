<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAfterSaleList, handleAfterSale } from '@/api/afterSale'

const loading = ref(false)
const afterSaleList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 售后状态映射
const statusMap = {
  1: { text: '待处理', type: 'warning' },
  2: { text: '处理中', type: 'primary' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已拒绝', type: 'danger' }
}

// 加载售后申请列表
const loadAfterSaleList = async () => {
  loading.value = true
  try {
    const res = await getAfterSaleList({
      current: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (res.success && res.data) {
      // 添加数据检查和默认值
      afterSaleList.value = (res.data.records || []).map(item => ({
        id: item.id || '',
        orderId: item.orderId || '',
        type: item.type || 1,
        reason: item.reason || '',
        amount: item.amount || 0,
        status: item.status || 1,
        createTime: item.createTime || new Date().toISOString(),
        description: item.description || '',
        images: item.images || '',
        // 其他可能的字段...
      }))
      total.value = res.data.total || 0
    } else {
      afterSaleList.value = []
      total.value = 0
      throw new Error(res.message || '获取售后列表失败')
    }
  } catch (error) {
    console.error('获取售后列表失败:', error)
    ElMessage.error(error.message || '获取售后列表失败')
  } finally {
    loading.value = false
  }
}

// 处理售后申请
const handleAfterSaleRequest = async (id, action, reason) => {
  try {
    // 二次确认
    await ElMessageBox.confirm(
      `确定要${action === 'approve' ? '同意' : '拒绝'}该售后申请吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: action === 'approve' ? 'success' : 'warning'
      }
    )

    const res = await handleAfterSale({
      id,
      status: action === 'approve' ? 3 : 4, // 3-已完成，4-已拒绝
      handleMsg: reason
    })

    if (res.success) {
      ElMessage.success(action === 'approve' ? '已同意售后申请' : '已拒绝售后申请')
      // 重新加载列表
      await loadAfterSaleList()
    } else {
      throw new Error(res.message || '处理失败')
    }
  } catch (error) {
    if (error === 'cancel') return // 用户取消操作
    console.error('处理售后申请失败:', error)
    ElMessage.error(error.message || '处理失败')
  }
}

// 审核对话框
const handleDialogVisible = ref(false)
const handleForm = ref({
  id: null,
  action: '',
  reason: ''
})

// 打开处理对话框
const openHandleDialog = (id, action) => {
  handleForm.value = {
    id,
    action,
    reason: ''
  }
  handleDialogVisible.value = true
}

// 提交处理
const submitHandle = async () => {
  if (!handleForm.value.reason) {
    ElMessage.warning('请输入处理原因')
    return
  }

  try {
    await handleAfterSaleRequest(
      handleForm.value.id,
      handleForm.value.action,
      handleForm.value.reason
    )
    handleDialogVisible.value = false
  } catch (error) {
    // 错误已在 handleAfterSaleRequest 中处理
  }
}

// 详情弹窗相关
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 修改查看详情方法，直接使用列表数据
const showDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 格式化图片列表
const formatImages = (images) => {
  if (!images) return []
  return images.split(',').filter(img => img)
}

// 修改表格列的渲染逻辑
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleString()
  } catch (e) {
    return dateString
  }
}

const formatAmount = (amount) => {
  if (typeof amount !== 'number') return '¥0.00'
  return `¥${(amount / 100).toFixed(2)}`
}

const getStatusTag = (status) => {
  const statusInfo = statusMap[status] || { text: '未知', type: 'info' }
  return statusInfo
}

onMounted(() => {
  loadAfterSaleList()
})
</script>

<template>
  <div class="after-sale-manage">
    <div class="page-header">
      <h2>售后管理</h2>
    </div>

    <el-table v-loading="loading" :data="afterSaleList" style="width: 100%" row-key="id">
      <el-table-column prop="id" label="售后单号" width="120">
        <template #default="{ row }">
          {{ row.id || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="关联订单" width="120">
        <template #default="{ row }">
          {{ row.orderId || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="售后类型" width="120">
        <template #default="{ row }">
          {{ row.type === 1 ? '仅退款' : '退货退款' }}
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="退款原因" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.reason || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="退款金额" width="120">
        <template #default="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status).type">
            {{ getStatusTag(row.status).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 1">
            <el-button 
              type="success" 
              size="small" 
              @click="openHandleDialog(row.id, 'approve')"
            >
              同意
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="openHandleDialog(row.id, 'reject')"
            >
              拒绝
            </el-button>
          </template>
          <el-button 
            type="primary" 
            size="small" 
            @click="showDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadAfterSaleList"
        @current-change="loadAfterSaleList"
      />
    </div>

    <!-- 处理售后申请对话框 -->
    <el-dialog
      v-model="handleDialogVisible"
      :title="handleForm.action === 'approve' ? '同意售后申请' : '拒绝售后申请'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="handleForm" label-width="80px">
        <el-form-item label="处理原因" required>
          <el-input
            v-model="handleForm.reason"
            type="textarea"
            rows="3"
            :placeholder="handleForm.action === 'approve' ? '请输入同意原因' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogVisible = false">取消</el-button>
          <el-button 
            :type="handleForm.action === 'approve' ? 'success' : 'danger'"
            @click="submitHandle"
          >
            确定{{ handleForm.action === 'approve' ? '同意' : '拒绝' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="售后详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-item">
          <span class="label">售后单号：</span>
          <span class="value">{{ currentDetail.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">关联订单：</span>
          <span class="value">{{ currentDetail.orderId }}</span>
        </div>
        <div class="detail-item">
          <span class="label">售后类型：</span>
          <span class="value">{{ currentDetail.type === 1 ? '仅退款' : '退货退款' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">退款金额：</span>
          <span class="value">¥{{ (currentDetail.amount / 100).toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">退款原因：</span>
          <span class="value">{{ currentDetail.reason }}</span>
        </div>
        <div class="detail-item">
          <span class="label">问题描述：</span>
          <span class="value">{{ currentDetail.description || '无' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">申请时间：</span>
          <span class="value">{{ new Date(currentDetail.createTime).toLocaleString() }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">
            <el-tag :type="statusMap[currentDetail.status].type">
              {{ statusMap[currentDetail.status].text }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">图片凭证：</span>
          <div class="image-list" v-if="formatImages(currentDetail.images).length > 0">
            <el-image
              v-for="(img, index) in formatImages(currentDetail.images)"
              :key="index"
              :src="img"
              :preview-src-list="formatImages(currentDetail.images)"
              fit="cover"
              class="evidence-image"
            />
          </div>
          <span v-else class="no-image">无图片</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.after-sale-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-item .label {
  width: 100px;
  color: #606266;
  font-weight: bold;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.evidence-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

.no-image {
  color: #909399;
  font-style: italic;
}

/* 图片预览样式优化 */
:deep(.el-image-viewer__wrapper) {
  .el-image-viewer__img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
  }
}
</style>