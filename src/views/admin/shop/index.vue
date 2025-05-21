<template>
  <div class="shop-management">
    <h2 class="page-title">商铺管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="商铺名称/编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="queryParams.type" placeholder="商铺类型" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" class="filter-item" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="primary" class="filter-item" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增商铺
      </el-button>
    </div>
    
    <!-- 商铺列表 -->
    <el-table
      v-loading="loading"
      :data="shopList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="商铺图片" width="100" align="center">
        <template #default="{ row }">
          <el-image
            style="width: 60px; height: 60px"
            :src="row.image"
            :preview-src-list="[row.image]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商铺名称" min-width="180" />
      <el-table-column prop="typeName" label="商铺类型" width="120" align="center" />
      <el-table-column prop="address" label="商铺地址" min-width="200" />
      <el-table-column prop="phone" label="联系电话" width="120" align="center" />
      <el-table-column prop="score" label="评分" width="100" align="center">
        <template #default="{ row }">
          <el-rate v-model="row.score" disabled text-color="#ff9900" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '营业中' : '休息中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      <el-table-column label="操作" width="250" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button 
            :type="row.status === 1 ? 'warning' : 'success'" 
            size="small" 
            @click="handleStatusChange(row)"
          >
            {{ row.status === 1 ? '休息' : '营业' }}
          </el-button>
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
    
    <!-- 商铺表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商铺名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商铺名称" />
        </el-form-item>
        
        <el-form-item label="商铺类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择商铺类型" style="width: 100%">
            <el-option v-for="item in shopTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商铺图片" prop="image">
          <el-upload
            class="shop-image-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleUpload"
          >
            <img v-if="form.image" :src="form.image" class="preview-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="商铺地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入商铺地址" />
        </el-form-item>
        
        <el-form-item label="营业时间" required>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="openTime">
                <el-time-picker
                  v-model="form.openTime"
                  format="HH:mm"
                  placeholder="开始时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="closeTime">
                <el-time-picker
                  v-model="form.closeTime"
                  format="HH:mm"
                  placeholder="结束时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="商铺状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">营业中</el-radio>
            <el-radio :label="0">休息中</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="商铺简介" prop="description">
          <el-input v-model="form.description" type="textarea" rows="4" placeholder="请输入商铺简介" />
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
  type: '',
  status: '',
  currentPage: 1,
  pageSize: 10
})

// 状态选项
const statusOptions = [
  { label: '营业中', value: 1 },
  { label: '休息中', value: 0 }
]

// 商铺类型选项
const shopTypeOptions = [
  { label: '美食', value: 1 },
  { label: '服装', value: 2 },
  { label: '电子', value: 3 },
  { label: '家居', value: 4 },
  { label: '超市', value: 5 },
  { label: '其他', value: 6 }
]

// 表格数据
const loading = ref(false)
const shopList = ref([
  { id: 1, name: '美食餐厅', type: 1, typeName: '美食', image: 'https://via.placeholder.com/60', address: '北京市朝阳区建国路88号', phone: '010-12345678', score: 4.5, status: 1, createTime: '2023-01-01 00:00:00', openTime: '08:00', closeTime: '22:00', description: '提供各种美食的餐厅' },
  { id: 2, name: '时尚服装店', type: 2, typeName: '服装', image: 'https://via.placeholder.com/60', address: '北京市海淀区中关村大街1号', phone: '010-87654321', score: 4.2, status: 1, createTime: '2023-01-02 00:00:00', openTime: '10:00', closeTime: '21:00', description: '销售各种时尚服装' },
  { id: 3, name: '电子产品店', type: 3, typeName: '电子', image: 'https://via.placeholder.com/60', address: '北京市西城区西单北大街123号', phone: '010-55556666', score: 4.8, status: 1, createTime: '2023-01-03 00:00:00', openTime: '09:00', closeTime: '20:00', description: '销售各种电子产品' },
  { id: 4, name: '家居生活馆', type: 4, typeName: '家居', image: 'https://via.placeholder.com/60', address: '北京市丰台区丰台路56号', phone: '010-33334444', score: 4.0, status: 0, createTime: '2023-01-04 00:00:00', openTime: '09:30', closeTime: '19:30', description: '提供各种家居用品' },
  { id: 5, name: '便利超市', type: 5, typeName: '超市', image: 'https://via.placeholder.com/60', address: '北京市东城区东直门外大街42号', phone: '010-99998888', score: 4.3, status: 1, createTime: '2023-01-05 00:00:00', openTime: '07:00', closeTime: '23:00', description: '24小时便利超市' }
])
const total = ref(5)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('create') // create or edit
const dialogTitle = computed(() => dialogType.value === 'create' ? '新增商铺' : '编辑商铺')
const formRef = ref(null)
const form = reactive({
  id: undefined,
  name: '',
  type: '',
  image: '',
  phone: '',
  address: '',
  openTime: '',
  closeTime: '',
  status: 1,
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商铺名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择商铺类型', trigger: 'change' }
  ],
  image: [
    { required: true, message: '请上传商铺图片', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入商铺地址', trigger: 'blur' }
  ],
  openTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  closeTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 搜索
const handleSearch = () => {
  queryParams.currentPage = 1
  fetchShopList()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchShopList()
}

const handleCurrentChange = (page) => {
  queryParams.currentPage = page
  fetchShopList()
}

// 获取商铺列表
const fetchShopList = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 新增商铺
const handleCreate = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  resetForm()
}

// 编辑商铺
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

// 删除商铺
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商铺 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    ElMessage.success('删除成功')
    fetchShopList()
  }).catch(() => {})
}

// 修改商铺状态
const handleStatusChange = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '营业' : '休息'
  
  ElMessageBox.confirm(`确定要将商铺 ${row.name} 状态改为${statusText}吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟状态变更
    row.status = newStatus
    ElMessage.success(`已将商铺 ${row.name} 状态改为${statusText}`)
  }).catch(() => {})
}

// 上传图片
const handleUpload = (options) => {
  // 模拟上传
  const file = options.file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    form.image = reader.result
  }
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
      // 模拟创建商铺
      ElMessage.success('创建商铺成功')
    } else {
      // 模拟更新商铺
      ElMessage.success('更新商铺成功')
    }
    
    dialogVisible.value = false
    fetchShopList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

onMounted(() => {
  fetchShopList()
})
</script>

<style scoped>
.shop-management {
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

.shop-image-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.shop-image-uploader:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>