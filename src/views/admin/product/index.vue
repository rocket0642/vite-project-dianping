<template>
  <div class="product-management">
    <h2 class="page-title">商品管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="商品名称/编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="queryParams.shopId" placeholder="所属商铺" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        新增商品
      </el-button>
    </div>
    
    <!-- 商品列表 -->
    <el-table
      v-loading="loading"
      :data="productList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="商品图片" width="100" align="center">
        <template #default="{ row }">
          <el-image
            style="width: 60px; height: 60px"
            :src="row.image"
            :preview-src-list="[row.image]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="180" />
      <el-table-column prop="price" label="价格" width="100" align="center">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" align="center" />
      <el-table-column prop="shopName" label="所属商铺" width="120" align="center" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
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
            {{ row.status === 1 ? '下架' : '上架' }}
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
    
    <!-- 商品表单对话框 -->
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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="所属商铺" prop="shopId">
          <el-select v-model="form.shopId" placeholder="请选择所属商铺" style="width: 100%">
            <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="product-image-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleUpload"
          >
            <img v-if="form.image" :src="form.image" class="preview-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择商品分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="4" placeholder="请输入商品描述" />
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
  shopId: '',
  status: '',
  currentPage: 1,
  pageSize: 10
})

// 状态选项
const statusOptions = [
  { label: '上架', value: 1 },
  { label: '下架', value: 0 }
]

// 商铺选项
const shopOptions = [
  { label: '美食店铺', value: 1 },
  { label: '服装店铺', value: 2 },
  { label: '电子产品店', value: 3 }
]

// 分类选项
const categoryOptions = [
  { label: '食品', value: 1 },
  { label: '服装', value: 2 },
  { label: '电子产品', value: 3 },
  { label: '家居', value: 4 },
  { label: '其他', value: 5 }
]

// 表格数据
const loading = ref(false)
const productList = ref([
  { id: 1, name: '香辣鸡腿堡', price: 15.00, stock: 100, image: 'https://via.placeholder.com/60', shopId: 1, shopName: '美食店铺', status: 1, createTime: '2023-01-01 00:00:00', categoryId: 1, description: '美味的香辣鸡腿堡' },
  { id: 2, name: '时尚T恤', price: 99.00, stock: 50, image: 'https://via.placeholder.com/60', shopId: 2, shopName: '服装店铺', status: 1, createTime: '2023-01-02 00:00:00', categoryId: 2, description: '舒适的时尚T恤' },
  { id: 3, name: '智能手机', price: 2999.00, stock: 30, image: 'https://via.placeholder.com/60', shopId: 3, shopName: '电子产品店', status: 1, createTime: '2023-01-03 00:00:00', categoryId: 3, description: '高性能智能手机' },
  { id: 4, name: '床上用品', price: 299.00, stock: 20, image: 'https://via.placeholder.com/60', shopId: 1, shopName: '美食店铺', status: 0, createTime: '2023-01-04 00:00:00', categoryId: 4, description: '舒适的床上用品' },
  { id: 5, name: '办公用品', price: 15.00, stock: 200, image: 'https://via.placeholder.com/60', shopId: 2, shopName: '服装店铺', status: 1, createTime: '2023-01-05 00:00:00', categoryId: 5, description: '实用的办公用品' }
])
const total = ref(5)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('create') // create or edit
const dialogTitle = computed(() => dialogType.value === 'create' ? '新增商品' : '编辑商品')
const formRef = ref(null)
const form = reactive({
  id: undefined,
  name: '',
  shopId: '',
  price: 0,
  stock: 0,
  image: '',
  categoryId: '',
  status: 1,
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  shopId: [
    { required: true, message: '请选择所属商铺', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ]
}

// 搜索
const handleSearch = () => {
  queryParams.currentPage = 1
  fetchProductList()
}

// 分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchProductList()
}

const handleCurrentChange = (page) => {
  queryParams.currentPage = page
  fetchProductList()
}

// 获取商品列表
const fetchProductList = () => {
  loading.value = true
  // 模拟异步请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 新增商品
const handleCreate = () => {
  dialogType.value = 'create'
  dialogVisible.value = true
  resetForm()
}

// 编辑商品
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

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除操作
    ElMessage.success('删除成功')
    fetchProductList()
  }).catch(() => {})
}

// 修改商品状态
const handleStatusChange = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '上架' : '下架'
  
  ElMessageBox.confirm(`确定要${statusText}商品 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟状态变更
    row.status = newStatus
    ElMessage.success(`已${statusText}商品: ${row.name}`)
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
    if (key === 'price' || key === 'stock') {
      form[key] = 0
    } else if (key === 'status') {
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
      // 模拟创建商品
      ElMessage.success('创建商品成功')
    } else {
      // 模拟更新商品
      ElMessage.success('更新商品成功')
    }
    
    dialogVisible.value = false
    fetchProductList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product-management {
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

.product-image-uploader {
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

.product-image-uploader:hover {
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
