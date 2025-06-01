<template>
  <div class="product-management">
    <h2 class="page-title">商品管理</h2>
    
    <!-- 搜索和过滤 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="商品名称"
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
            :src="Array.isArray(row.images) ? row.images[0] : row.images"
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
          <el-button 
            v-if="row.orderStatus === 2" 
            type="success" 
            size="small" 
            @click="handleShip(row)"
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
          <el-button 
            v-if="row.orderStatus === 4" 
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
            <el-option v-for="item in shopOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="imagesList">
          <el-upload
            class="product-image-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :headers="uploadHeaders"
            :data="uploadData"
            accept="image/*"
            :multiple="false"
          >
            <template #default>
              <div class="image-list">
                <div v-if="form.imagesList.length > 0" style="position:relative;">
                  <img :src="form.imagesList[0]" class="preview-image" />
                  <el-icon
                    style="position:absolute;top:2px;right:2px;cursor:pointer;color:red;"
                    @click.stop="form.imagesList.splice(0,1)"
                  ><Close /></el-icon>
                </div>
                <el-icon
                  v-else
                  class="upload-icon"
                ><Plus /></el-icon>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择商品分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
        
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
import { Search, Plus, Close } from '@element-plus/icons-vue'
import { getGoodsList, updateGoods, addGoods, updateGoodsStatus, deleteGoods } from '@/api/goods'
import { getAllShopNames } from '@/api/shop'

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
const shopOptions = ref([])

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
const productList = ref([])
const total = ref(0)

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
  originalPrice: 0,
  stock: 0,
  imagesList: [],
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
  imagesList: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  originalPrice: [
    { required: true, message: '请输入商品原价', trigger: 'blur' }
  ]
  // categoryId: [
  //   { required: true, message: '请选择商品分类', trigger: 'change' }
  // ]
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
const fetchProductList = async () => {
  loading.value = true
  try {
    const res = await getGoodsList({
      page: queryParams.currentPage,
      size: queryParams.pageSize,
      keyword: queryParams.keyword,
      status: queryParams.status,
      shopId: queryParams.shopId
    })
    if (res.success) {
      productList.value = (res.data.list || []).map(item => ({
        ...item,
        price: (item.price / 100).toFixed(2),
        originalPrice: item.originalPrice ? (item.originalPrice / 100).toFixed(2) : undefined
      }))
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
    }
  } finally {
    loading.value = false
  }
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
    if (key === 'imagesList') {
      form.imagesList = Array.isArray(row.images) ? row.images : []
    } else if (key === 'price' || key === 'originalPrice') {
      // 这里 row[key] 可能已经是字符串（如 "98.00"），也可能是数字（如 9800）
      // 只在 row[key] 是整数时才分转元，否则直接赋值
      if (typeof row[key] === 'number' && row[key] > 10) {
        form[key] = (row[key] / 100)
      } else {
        form[key] = row[key] || 0
      }
    } else if (key in row) {
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
  }).then(async () => {
    // 调用后端接口删除
    const res = await deleteGoods(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchProductList() // 重新拉取商品列表
    } else {
      ElMessage.error(res.message || '删除失败')
    }
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
  }).then(async () => {
    // 调用后端接口修改状态
    const res = await updateGoodsStatus(row.id, newStatus)
    if (res.success) {
      ElMessage.success(`已${statusText}商品: ${row.name}`)
      fetchProductList() // 刷新列表，确保状态和数据库一致
    } else {
      ElMessage.error(res.message || `商品${statusText}失败`)
    }
  }).catch(() => {})
}

// 上传图片
const uploadUrl = '/api/upload/save' // 后端上传接口
const uploadHeaders = {} // 需要认证时加token
const uploadData = { type: 'product' } // 必须有type字段，和后端接口一致

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  return isImage
}

// 上传成功回调
const handleUploadSuccess = (response, file) => {
  if (response.success) {
    form.imagesList = [response.data] // 单图
    // form.imagesList.push(response.data) // 多图
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.keys(form).forEach(key => {
    if (key === 'price' || key === 'stock' || key === 'originalPrice') {
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
  await formRef.value.validate()
  // 构造提交数据，价格和原价都转为分
  const submitData = {
    ...form,
    price: Math.round(form.price * 100), // 元转分
    originalPrice: Math.round(form.originalPrice * 100), // 元转分
    images: Array.isArray(form.imagesList) ? form.imagesList.join(',') : ''
  }
  delete submitData.imagesList

  const res = dialogType.value === 'create'
    ? await addGoods(submitData)
    : await updateGoods(submitData)
  if (res.success) {
    ElMessage.success(dialogType.value === 'create' ? '创建商品成功' : '更新商品成功')
    dialogVisible.value = false
    fetchProductList()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 获取商铺列表
const fetchShopOptions = async () => {
  const res = await getAllShopNames()
  if (res.success) {
    shopOptions.value = res.data
  }
}

onMounted(() => {
  fetchShopOptions()
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
  box-sizing: border-box;
  padding: 0;

}

.product-image-uploader:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid transparent;
  margin: 0;
  display: block;
  box-sizing: border-box;
}

.image-list {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
</style>
