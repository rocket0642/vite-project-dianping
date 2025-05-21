<template>
  <div class="user-management">
    <h2 class="page-title">用户管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="用户名/手机号/邮箱"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" class="filter-item" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="primary" class="filter-item" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>
    
    <!-- 用户列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column label="角色" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.role === 'admin'" type="danger">管理员</el-tag>
          <el-tag v-else-if="row.role === 'manager'" type="warning">经理</el-tag>
          <el-tag v-else-if="row.role === 'operator'" type="success">运营</el-tag>
          <el-tag v-else type="info">普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" align="center" width="180" />
      <el-table-column label="操作" align="center" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'create'">
          <el-input v-model="form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="运营" value="operator" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  keyword: '',
  status: '',
  currentPage: 1,
  pageSize: 10
})

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

// 表格数据
const loading = ref(false)
const userList = ref([
  { id: 1, username: 'admin', name: '管理员', phone: '13800138000', email: 'admin@example.com', role: 'admin', status: 1, createTime: '2023-01-01 00:00:00' },
  { id: 2, username: 'manager', name: '经理', phone: '13800138001', email: 'manager@example.com', role: 'manager', status: 1, createTime: '2023-01-02 00:00:00' },
  { id: 3, username: 'operator', name: '运营', phone: '13800138002', email: 'operator@example.com', role: 'operator', status: 1, createTime: '2023-01-03 00:00:00' },
  { id: 4, username: 'user1', name: '用户1', phone: '13800138003', email: 'user1@example.com', role: 'user', status: 1, createTime: '2023-01-04 00:00:00' },
  { id: 5, username: 'user2', name: '用户2', phone: '13800138004', email: 'user2@example.com', role: 'user', status: 0, createTime: '2023-01-05 00:00:00' }
])
const total = ref(5)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('create') // create or edit
const dialogTitle = computed(() => dialogType.value === 'create' ? '新增用户' : '编辑用户')
const formRef = ref(null)
const form = reactive({
  id: undefined,
  username: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  role: 'user',
  status: 1
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 搜索
const handleSearch = () => {
  queryParams.currentPage = 1
  fetchUserList()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchUserList()
}

const handleCurrentChange = (page) => {
  queryParams.currentPage = page
  fetchUserList()
}

// 获取用户列表
const fetchUserList = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 新增用户
const handleCreate = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  resetForm()
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  // 填充表单
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    ElMessage.success('删除成功')
    fetchUserList()
  }).catch(() => {})
}

// 修改用户状态
const handleStatusChange = (row) => {
  const statusText = row.status === 1 ? '启用' : '禁用'
  ElMessage.success(`已${statusText}用户: ${row.name}`)
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置表单数据
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = 1
    } else if (key === 'role') {
      form[key] = 'user'
    } else {
      form[key] = ''
    }
  })
  form.id = undefined
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogType.value === 'create') {
      // 模拟创建用户
      ElMessage.success('创建用户成功')
    } else {
      // 模拟更新用户
      ElMessage.success('更新用户成功')
    }
    
    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
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
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>