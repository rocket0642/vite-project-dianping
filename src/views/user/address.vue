<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AddressForm from '../../components/AddressForm.vue'
import AppLayout from '../../components/AppLayout.vue'
import { useAddressStore } from '../../stores/address'
import { useUserStore } from '../../stores/user'

// 路由实例
const router = useRouter()

// 用户状态和地址状态
const userStore = useUserStore()
const addressStore = useAddressStore()

// 组件状态
const formVisible = ref(false)
const isEdit = ref(false)
const currentAddress = ref({})

/**
 * 加载地址列表
 */
const loadAddresses = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/user/address')
    return
  }
  
  await addressStore.fetchAddresses()
}

/**
 * 打开添加地址表单
 */
const openAddForm = () => {
  isEdit.value = false
  currentAddress.value = {
    name: '',
    phone: '',
    address: '',
    isDefault: false
  }
  formVisible.value = true
}

/**
 * 打开编辑地址表单
 */
const openEditForm = (address) => {
  isEdit.value = true
  currentAddress.value = { ...address }
  formVisible.value = true
}

/**
 * 提交地址表单
 */
const handleSubmit = async (address) => {
  try {
    if (isEdit.value) {
      await addressStore.updateAddress(address)
    } else {
      await addressStore.addAddress(address)
    }
    formVisible.value = false
  } catch (error) {
    console.error('保存地址失败:', error)
  }
}

/**
 * 设置默认地址
 */
const handleSetDefault = async (id) => {
  await addressStore.setDefault(id)
}

/**
 * 删除地址
 */
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这个地址吗？', '删除提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await addressStore.removeAddress(id)
  }).catch(() => {
    // 用户取消操作
  })
}

/**
 * 组件挂载时获取地址列表
 */
onMounted(() => {
  loadAddresses()
})
</script>

<template>
  <AppLayout>
    <div class="address-manage-container">
      <div class="page-header">
        <h2 class="page-title">收货地址管理</h2>
        <el-button @click="router.back()">返回</el-button>
      </div>
      
      <div class="address-list-container">
        <el-button type="primary" @click="openAddForm" class="add-address-btn">
          <el-icon><Plus /></el-icon>
          添加新地址
        </el-button>
        
        <div v-loading="addressStore.isLoading" class="address-list">
          <div v-if="addressStore.addressList.length === 0 && !addressStore.isLoading" class="empty-tip">
            <el-empty description="暂无收货地址" />
            <el-button type="primary" @click="openAddForm">添加地址</el-button>
          </div>
          
          <div v-for="address in addressStore.addressList" :key="address.id" class="address-item">
            <div class="address-info">
              <div class="address-header">
                <span class="address-name">{{ address.name }}</span>
                <span class="address-phone">{{ address.phone }}</span>
                <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
              </div>
              <div class="address-detail">{{ address.address }}</div>
            </div>
            <div class="address-actions">
              <el-button 
                v-if="!address.isDefault" 
                type="text" 
                @click="handleSetDefault(address.id)"
              >
                设为默认
              </el-button>
              <el-button type="text" @click="openEditForm(address)">编辑</el-button>
              <el-button type="text" @click="handleDelete(address.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 地址表单对话框 -->
      <AddressForm
        v-if="formVisible"
        v-model="formVisible"
        :address="currentAddress"
        :is-edit="isEdit"
        @submit="handleSubmit"
      />
    </div>
  </AppLayout>
</template>

<style scoped>
.address-manage-container {
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

.address-list-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.add-address-btn {
  margin-bottom: 20px;
}

.empty-tip {
  text-align: center;
  padding: 30px 0;
}

.address-list {
  margin-top: 15px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.address-item:last-child {
  border-bottom: none;
}

.address-header {
  margin-bottom: 8px;
}

.address-name {
  font-weight: 600;
  margin-right: 10px;
}

.address-phone {
  color: #606266;
}

.address-detail {
  color: #606266;
  font-size: 14px;
}

.address-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .address-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .address-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>