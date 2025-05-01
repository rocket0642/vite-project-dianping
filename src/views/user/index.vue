<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getUserAddresses } from '../../api/address'
import { updateUserInfo, updateUserDetail, getUserInfo } from '../../api/user'
import { getUserOrders } from '../../api/order'
import { ElMessage, ElMessageBox, ElAvatar, ElButton, ElDialog, ElForm, ElFormItem, ElInput, 
  ElUpload, ElIcon, ElTag, ElSkeleton, ElSkeletonItem, ElSelect, ElOption, ElDatePicker, ElRadio, ElRadioGroup } from 'element-plus'
import { Plus, Edit, Delete, Location, Money, Box, Van, ChatDotRound, Document } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 用户状态
const userStore = useUserStore()

// 组件状态
const loading = ref(true)
const addressLoading = ref(true)
const orderStatsLoading = ref(true)

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const userPhone = computed(() => userStore.userPhone)

// 编辑对话框可见性
const editDialogVisible = ref(false)

// 统一编辑表单数据
const editForm = ref({
  // 基本信息
  id: '',
  nickName: '',
  icon: '',
  city: '',
  introduce: '',
  gender: true,
  birthday: '',
  email: ''
})

// 图片上传URL
const uploadUrl = ref('/api/upload')

// 订单数据
const orderStats = ref({
  paid: 0,
  unpaid: 0,
  canceled: 0,
  unreceived: 0,
  uncommented: 0
})

// 地址数据
const addresses = ref([])

// 最近浏览数据
const recentViews = ref([])

/**
 * 加载用户地址
 */
const loadUserAddresses = async () => {
  try {
    addressLoading.value = true
    const res = await getUserAddresses()
    addresses.value = res.slice(0, 3) // 只显示前3个地址
    addressLoading.value = false
  } catch (error) {
    console.error('获取地址列表失败:', error)
    addressLoading.value = false
  }
}

/**
 * 打开编辑对话框
 */
const openEditDialog = () => {
  console.log('当前用户信息:', userInfo.value) // 添加日志
  
  // 统一设置所有用户信息
  editForm.value = {
    // 基本信息
    id: userInfo.value.id,
    nickName: userInfo.value.nickName || '',
    icon: userInfo.value.icon || '',
    city: userInfo.value.city || '',
    introduce: userInfo.value.introduce || '',
    gender: userInfo.value.gender !== undefined ? userInfo.value.gender : false,
    birthday: userInfo.value.birthday || '',
    email: userInfo.value.email || ''
  }
  
  console.log('填充到表单的信息:', editForm.value) // 添加日志
  editDialogVisible.value = true
}

/**
 * 处理图片上传成功
 * @param {Object} response - 上传响应
 */
const handleUploadSuccess = (response) => {
  // 实际项目中应该从响应中获取图片URL
  editForm.value.icon = response.data || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  ElMessage.success('头像上传成功')
}

/**
 * 处理图片上传失败
 */
const handleUploadError = () => {
  ElMessage.error('头像上传失败')
}

/**
 * 提交编辑表单
 */
const submitEditForm = async () => {
  try {
    // 更新基本信息
    await updateUserInfo({
      id: editForm.value.id,
      nickName: editForm.value.nickName,
      icon: editForm.value.icon
    })
    
    // 更新详细信息
    await updateUserDetail({
      city: editForm.value.city,
      introduce: editForm.value.introduce,
      gender: editForm.value.gender,
      birthday: editForm.value.birthday,
      email: editForm.value.email
    })
    
    // 强制更新本地用户信息
    await userStore.fetchUserInfo()
    
    // 直接更新本地计算属性，确保视图立即更新
    Object.assign(userStore.userInfo, {
      nickName: editForm.value.nickName,
      icon: editForm.value.icon,
      city: editForm.value.city,
      introduce: editForm.value.introduce,
      gender: editForm.value.gender,
      birthday: editForm.value.birthday,
      email: editForm.value.email
    })
    
    ElMessage.success('个人信息更新成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败: ' + error.message)
  }
}

/**
 * 跳转到订单列表
 * @param {number} status - 订单状态
 */
const goToOrderList = (status) => {
  router.push(`/order/list?status=${status}`)
}

/**
 * 跳转到地址管理页面
 */
const goToAddressManage = () => {
  router.push('/user/address')
}

/**
 * 跳转到商铺详情
 * @param {number} id - 商铺ID
 */
const goToShopDetail = (id) => {
  router.push(`/shop/${id}`)
}

/**
 * 退出登录
 */
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }).catch(() => {})
}

/**
 * 加载订单统计数据
 */
const loadOrderStats = async () => {
  try {
    orderStatsLoading.value = true;
    // 获取当前用户的订单数据
    const res = await getUserOrders({ status: 0 });
    
    if (res.success && res.data) {
    // 计算各个状态的订单数量
    const stats = {
        paid: 0,      // 已支付
        unpaid: 0,     // 待付款
        canceled: 0,   // 已取消
        unreceived: 0, // 待收货
        uncommented: 0 // 待评价
      };
      
      res.data.forEach(order => {
        if (order.status === 2) stats.paid++;
        else if (order.status === 1) stats.unpaid++;
        else if (order.status === 3) stats.canceled++;
        else if (order.status === 4) stats.unreceived++;
        else if (order.status === 5 && !order.commented) stats.uncommented++;
      });
    
      orderStats.value = stats;
    }
    orderStatsLoading.value = false;
  } catch (error) {
    console.error('获取订单统计失败:', error);
    orderStatsLoading.value = false;
  }
};

/**
 * 加载最近浏览数据
 */
const loadRecentViews = async () => {
  // 从本地存储获取浏览记录数据
  try {
    const userPhone = useUserStore.userPhone
    const viewsData = localStorage.getItem(`recent_views_${userPhone}`)
    if (viewsData) {
      recentViews.value = JSON.parse(viewsData).slice(0, 4) // 只显示最近4条
    }
  } catch (e) {
    console.error('加载浏览记录失败:', e)
  }
}

/**
 * 页面加载时执行
 */
onMounted(async () => {
  // 如果未登录，跳转到登录页
  if (!userStore.isLogin) {
    router.push('/login?redirect=/user')
    return
  }
  
  loading.value = true
  
  try {
    // 先获取最新用户信息
    await userStore.fetchUserInfo()
    console.log('获取到的用户信息:', userStore.userInfo)
    
    // 然后并行加载其他数据
    await Promise.all([
      loadUserAddresses(),
      loadOrderStats(),
      loadRecentViews()
    ])
  } catch (error) {
    console.error('加载用户中心数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
})

// 监听用户ID变化，重新加载数据
watch(() => userStore.userPhone, (newUserPhone, oldUserPhone) => {
  if (newUserPhone && newUserPhone !== oldUserPhone) {
    loadUserAddresses()
    loadOrderStats()
    loadRecentViews()
  }
}, { immediate: true })

// 监听对话框显示状态，确保每次打开都重新获取最新用户数据
watch(() => editDialogVisible.value, (newVal) => {
  if (newVal) {
    // 如果对话框打开，强制同步最新用户信息到表单
    editForm.value = {
      id: userInfo.value.id,
      nickName: userInfo.value.nickName || '',
      icon: userInfo.value.icon || '',
      city: userInfo.value.city || '',
      introduce: userInfo.value.introduce || '', 
      gender: userInfo.value.gender !== undefined ? userInfo.value.gender : false,
      birthday: userInfo.value.birthday || '',
      email: userInfo.value.email || ''
    }
  }
})
</script>

<template>
  <div class="user-center-container">
    <!-- 添加返回按钮 -->
    <div class="back-button">
      <el-button type="text" icon="ArrowLeft" @click="$router.go(-1)">返回</el-button>
    </div>
    
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-user-info">
            <el-skeleton-item variant="circle" style="width: 80px; height: 80px;" />
            <div class="skeleton-user-details">
              <el-skeleton-item variant="text" style="width: 150px; height: 24px; margin-bottom: 12px;" />
              <el-skeleton-item variant="text" style="width: 240px; height: 16px; margin-bottom: 8px;" />
              <el-skeleton-item variant="text" style="width: 300px; height: 16px;" />
            </div>
          </div>
        </template>
        
        <template #default>
          <div class="user-header">
            <div class="avatar-container">
              <el-avatar 
                :size="100" 
                :src="userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
              />
            </div>
            <div class="user-basic-info">
              <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
              <div class="edit-btn-container">
                <el-button type="primary" size="small" @click="openEditDialog" class="edit-btn">
                  <el-icon><Edit /></el-icon>
                  编辑资料
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="user-info-grid">
            <div class="info-item">
              <div class="info-label">性别:</div>
              <div class="info-value">{{ userInfo.gender ? '女' : '男' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">城市:</div>
              <div class="info-value">{{ userInfo.city || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">生日:</div>
              <div class="info-value">{{ userInfo.birthday || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">邮箱:</div>
              <div class="info-value">{{ userInfo.email || '未设置' }}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">个人介绍:</div>
              <div class="info-value">{{ userInfo.introduce || '这个人很懒，什么都没留下' }}</div>
            </div>
          </div>
        </template>
      </el-skeleton>

      <div class="user-actions">
        <el-button type="danger" @click="logout">退出登录</el-button>
      </div>
    </div>

    <!-- 订单快捷入口 -->
    <div class="section-card">
      <h3 class="section-title">我的订单</h3>
      <div class="order-shortcuts" v-loading="orderStatsLoading">
        <div class="shortcut-item" @click="goToOrderList(0)">
          <el-icon><Document /></el-icon>
          <span class="shortcut-label">全部订单</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(2)">
          <el-icon><Box /></el-icon>
          <span class="shortcut-label">已支付</span>
          <span v-if="orderStats.paid > 0" class="badge">{{ orderStats.paid }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(1)">
          <el-icon><Money /></el-icon>
          <span class="shortcut-label">待付款</span>
          <span v-if="orderStats.unpaid > 0" class="badge">{{ orderStats.unpaid }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(3)">
          <el-icon><Document /></el-icon>
          <span class="shortcut-label">已取消</span>
          <span v-if="orderStats.canceled > 0" class="badge">{{ orderStats.canceled }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(4)">
          <el-icon><Van /></el-icon>
          <span class="shortcut-label">待收货</span>
          <span v-if="orderStats.unreceived > 0" class="badge">{{ orderStats.unreceived }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(5)">
          <el-icon><ChatDotRound /></el-icon>
          <span class="shortcut-label">待评价</span>
          <span v-if="orderStats.uncommented > 0" class="badge">{{ orderStats.uncommented }}</span>
        </div>
      </div>
    </div>

    <!-- 我的地址 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">我的地址</h3>
        <el-button type="text" @click="goToAddressManage">管理</el-button>
      </div>
      
      <el-skeleton :loading="addressLoading" animated :count="3">
        <template #template>
          <div class="skeleton-address">
            <el-skeleton-item variant="text" style="width: 90%; height: 20px; margin-bottom: 8px;" />
            <el-skeleton-item variant="text" style="width: 60%; height: 16px;" />
          </div>
        </template>
        
        <template #default>
          <div v-if="addresses.length > 0" class="address-list">
            <div v-for="address in addresses" :key="address.id" class="address-item">
              <div class="address-info">
                <div class="address-header">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-detail">{{ address.address }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-address">
            <el-icon><Location /></el-icon>
            <p>您还没有添加收货地址</p>
            <el-button type="primary" size="small" @click="goToAddressManage">添加地址</el-button>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 最近浏览 -->
    <div class="section-card">
      <h3 class="section-title">最近浏览</h3>
      <div class="recent-views">
        <div v-for="item in recentViews" :key="item.id" class="view-item" @click="goToShopDetail(item.id)">
          <div class="view-image">
            <img :src="item.image" :alt="item.name">
          </div>
          <div class="view-info">
            <div class="view-name">{{ item.name }}</div>
            <div class="view-time">{{ item.time }}</div>
          </div>
        </div>
        <div v-if="recentViews.length === 0" class="empty-views">
          <p>暂无浏览记录</p>
        </div>
      </div>
    </div>

    <!-- 统一的编辑信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <!-- 基本信息 -->
        <h4 class="form-section-title">基本信息</h4>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            accept="image/*"
          >
            <img v-if="editForm.icon" :src="editForm.icon" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称"></el-input>
        </el-form-item>
        
        <!-- 详细信息 -->
        <h4 class="form-section-title">详细信息</h4>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="true">女</el-radio>
            <el-radio :label="false">男</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="editForm.city" placeholder="请输入所在城市"></el-input>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="editForm.birthday"
            type="date"
            placeholder="选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="个人介绍">
          <el-input
            v-model="editForm.introduce"
            type="textarea"
            :rows="3"
            placeholder="请输入个人介绍"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 添加返回按钮样式 */
.back-button {
  margin-bottom: 15px;
}

.user-center-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.user-card, .section-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar-container {
  margin-right: 20px;
}

.user-basic-info {
  flex: 1;
  position: relative;
}

.edit-btn-container {
  position: absolute;
  top: 0;
  right: 0;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.info-item {
  display: flex;
  align-items: baseline;
}

.full-width {
  grid-column: span 2;
}

.info-label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #303133;
}

.user-actions {
  display: flex;
  justify-content: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #303133;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 5px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.order-shortcuts {
  display: flex;
  justify-content: space-between;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  padding: 15px 0;
  flex: 1;
}

.shortcut-item:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.shortcut-label {
  margin-top: 8px;
  font-size: 14px;
}

.badge {
  position: absolute;
  top: 5px;
  right: 15px;
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}

.address-list {
  margin-top: 10px;
}

.skeleton-address {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
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
  gap: 10px;
}

.empty-address, .empty-views {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-address p, .empty-views p {
  margin: 10px 0;
}

.recent-views {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.view-item {
  width: calc(50% - 8px);
  display: flex;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.view-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.view-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
}

.view-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-info {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.view-name {
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-time {
  color: #909399;
  font-size: 12px;
}

.avatar-uploader {
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
}

@media (max-width: 768px) {
  .view-item {
    width: 100%;
  }
  
  .order-shortcuts {
    flex-wrap: wrap;
  }
  
  .shortcut-item {
    width: 20%;
  }
  
  .edit-btn-container {
    position: static;
    margin-top: 10px;
  }
  
  .user-info-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
}
</style>