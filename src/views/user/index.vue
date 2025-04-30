<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { updateUserInfo } from '../../api/user'
import { ElMessage, ElAvatar, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElUpload, ElIcon } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 用户状态
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 编辑对话框可见性
const editDialogVisible = ref(false)

// 编辑表单数据
const editForm = ref({
  id: '',
  nickName: '',
  icon: ''
})

// 图片上传URL（实际项目中应该有专门的上传接口）
const uploadUrl = ref('/api/upload')

// 模拟订单数据
const orderStats = ref({
  unpaid: 2,
  undelivered: 1,
  unreceived: 3,
  uncommented: 5
})

// 模拟地址数据
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    address: '浙江省杭州市西湖区文三路 789 号',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    address: '浙江省杭州市滨江区江南大道 123 号',
    isDefault: false
  }
])

// 模拟最近浏览数据
const recentViews = ref([
  {
    id: 1,
    name: '品味轩餐厅',
    image: 'https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg',
    time: '2023-05-20 14:30'
  },
  {
    id: 2,
    name: '舒适酒店',
    image: 'https://p0.meituan.net/wedding/d9dc9123ecf39c99a5ee4df9ea37fc23333192.jpg',
    time: '2023-05-19 10:15'
  },
  {
    id: 3,
    name: '欢乐KTV',
    image: 'https://p1.meituan.net/scarlett/e8efc66f0186abf3415ec815ded58aa9377348.jpg',
    time: '2023-05-18 20:45'
  }
])

/**
 * 打开编辑对话框
 */
const openEditDialog = () => {
  editForm.value = {
    id: userInfo.value.id,
    nickName: userInfo.value.nickName,
    icon: userInfo.value.icon
  }
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
    await updateUserInfo(editForm.value)
    // 更新本地用户信息
    await userStore.fetchUserInfo()
    ElMessage.success('个人信息更新成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
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
  userStore.logout()
  router.push('/login')
  ElMessage.success('退出登录成功')
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
  
  // 刷新用户信息
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
})
</script>

<template>
  <div class="user-center-container">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <el-avatar 
          :size="80" 
          :src="userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
        />
        <div class="user-details">
          <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
          <p class="user-meta">{{ userInfo.city || '未设置城市' }} · {{ userInfo.gender ? '女' : '男' }}</p>
          <p class="user-intro">{{ userInfo.introduce || '这个人很懒，什么都没留下' }}</p>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.fans || 0 }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.followee || 0 }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userInfo.credits || 0 }}</div>
          <div class="stat-label">积分</div>
        </div>
      </div>
      <div class="user-actions">
        <el-button type="primary" @click="openEditDialog">编辑资料</el-button>
        <el-button @click="logout">退出登录</el-button>
      </div>
    </div>

    <!-- 订单快捷入口 -->
    <div class="section-card">
      <h3 class="section-title">我的订单</h3>
      <div class="order-shortcuts">
        <div class="shortcut-item" @click="goToOrderList(1)">
          <el-icon><Money /></el-icon>
          <span class="shortcut-label">待付款</span>
          <span v-if="orderStats.unpaid > 0" class="badge">{{ orderStats.unpaid }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(2)">
          <el-icon><Box /></el-icon>
          <span class="shortcut-label">待发货</span>
          <span v-if="orderStats.undelivered > 0" class="badge">{{ orderStats.undelivered }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(3)">
          <el-icon><Van /></el-icon>
          <span class="shortcut-label">待收货</span>
          <span v-if="orderStats.unreceived > 0" class="badge">{{ orderStats.unreceived }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(4)">
          <el-icon><ChatDotRound /></el-icon>
          <span class="shortcut-label">待评价</span>
          <span v-if="orderStats.uncommented > 0" class="badge">{{ orderStats.uncommented }}</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(0)">
          <el-icon><Document /></el-icon>
          <span class="shortcut-label">全部订单</span>
        </div>
      </div>
    </div>

    <!-- 我的地址 -->
    <div class="section-card">
      <h3 class="section-title">我的地址</h3>
      <div class="address-list">
        <div v-for="address in addresses" :key="address.id" class="address-item">
          <div class="address-info">
            <div class="address-header">
              <span class="address-name">{{ address.name }}</span>
              <span class="address-phone">{{ address.phone }}</span>
              <span v-if="address.isDefault" class="default-tag">默认</span>
            </div>
            <div class="address-detail">{{ address.address }}</div>
          </div>
          <div class="address-actions">
            <el-button type="text">编辑</el-button>
            <el-button type="text">删除</el-button>
          </div>
        </div>
        <div class="add-address">
          <el-button type="dashed" icon="Plus">添加新地址</el-button>
        </div>
      </div>
    </div>

    <!-- 最近浏览 -->
    <div class="section-card">
      <h3 class="section-title">最近浏览</h3>
      <div class="recent-views">
        <div 
          v-for="item in recentViews" 
          :key="item.id" 
          class="view-item"
          @click="goToShopDetail(item.id)"
        >
          <div class="view-image">
            <el-image :src="item.image" fit="cover" />
          </div>
          <div class="view-info">
            <div class="view-name">{{ item.name }}</div>
            <div class="view-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <img v-if="editForm.icon" :src="editForm.icon" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-center-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 用户信息卡片样式 */
.user-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-details {
  margin-left: 20px;
}

.user-name {
  font-size: 22px;
  margin: 0 0 5px 0;
}

.user-meta {
  color: #666;
  margin: 0 0 5px 0;
}

.user-intro {
  color: #999;
  margin: 0;
}

.user-stats {
  display: flex;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 通用卡片样式 */
.section-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin: 0 0 20px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #409EFF;
  border-radius: 2px;
}

/* 订单快捷入口样式 */
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
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.shortcut-item:hover {
  background-color: #f5f7fa;
}

.shortcut-item .el-icon {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
}

.shortcut-label {
  font-size: 14px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f56c6c;
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}

/* 地址列表样式 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.address-header {
  margin-bottom: 8px;
}

.address-name {
  font-weight: bold;
  margin-right: 10px;
}

.address-phone {
  color: #666;
}

.default-tag {
  background-color: #409EFF;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
  margin-left: 10px;
}

.address-detail {
  color: #666;
}

.add-address {
  display: flex;
  justify-content: center;
  padding: 15px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-address:hover {
  border-color: #409EFF;
  color: #409EFF;
}

/* 最近浏览样式 */
.recent-views {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.view-item {
  width: 200px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.view-item:hover {
  transform: translateY(-5px);
}

.view-image {
  height: 120px;
}

.view-image .el-image {
  width: 100%;
  height: 100%;
}

.view-info {
  padding: 10px;
}

.view-name {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-time {
  font-size: 12px;
  color: #999;
}

/* 头像上传样式 */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-details {
    margin-left: 0;
    margin-top: 15px;
  }
  
  .order-shortcuts {
    flex-wrap: wrap;
  }
  
  .shortcut-item {
    width: 33.33%;
    margin-bottom: 15px;
  }
}
</style>