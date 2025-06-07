<script setup>
import { ElButton } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '../../stores/address'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { useFravoriteStore } from '../../stores/fravorite'

// 导入拆分的组件
import UserInfoCard from '../../components/user/UserInfoCard.vue'
import OrderShortcuts from '../../components/user/OrderShortcuts.vue'
import UserAddressList from '../../components/user/UserAddressList.vue'
import UserFavoritesList from '../../components/user/UserFavoritesList.vue'
import OrderStatistics from '../../components/user/OrderStatistics.vue'
import UserEditForm from '../../components/user/UserEditForm.vue'

// 用户状态
const userStore = useUserStore()
// 添加地址状态
const addressStore = useAddressStore()
// 添加订单状态
const orderStore = useOrderStore()
// 收藏状态
const favoriteStore = useFravoriteStore()

// 组件状态
const loading = ref(true)
const addressLoading = ref(true)
const statisticsLoading = ref(true)
const favoritesLoading = ref(true)

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 编辑对话框可见性
const editDialogVisible = ref(false)

// 订单统计数据
const orderStatistics = ref({
  orderStatus: [],
  monthlySpending: [],
  totalOrders: 0,
  totalAmount: 0
})

/**
 * 加载用户地址
 */
const loadUserAddresses = async () => {
  if (!userStore.isLogin) {
    return
  }
  try {
    addressLoading.value = true
    // 使用store的方法获取地址
    await addressStore.fetchAddresses()
    addressLoading.value = false
  } catch (error) {
    console.error('获取地址列表失败:', error)
    addressLoading.value = false
  }
}

/**
 * 加载订单统计数据
 */
const loadOrderStatistics = async () => {
  if (!userStore.isLogin) {
    return
  }

  try {
    statisticsLoading.value = true
    const res = await orderStore.fetchOrderStatistics()
    if (res.success) {
      orderStatistics.value = res.data
    }
  } catch (error) {
    console.error('获取订单统计数据失败:', error)
  } finally {
    statisticsLoading.value = false
  }
}

/**
 * 加载用户收藏
 */
const loadUserFavorites = async () => {
  if (!userStore.isLogin) {
    return;
  }
  try {
    favoritesLoading.value = true;
    await favoriteStore.getFavoriteList();
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  } finally {
    favoritesLoading.value = false;
  }
}

/**
 * 打开编辑对话框
 */
const openEditDialog = () => {
  editDialogVisible.value = true
}

/**
 * 页面加载时执行
 */
onMounted(async () => {
  // 如果未登录，跳转到登录页
  if (!userStore.isLogin) {
    return
  }

  loading.value = true

  try {
    loadUserAddresses()
    loadOrderStatistics()
    loadUserFavorites()
  } catch (error) {
    console.error('加载用户中心数据失败:', error)
  } finally {
    loading.value = false
  }
})

/**
 * 刷新用户信息
 */
const refreshUserInfo = async () => {
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}
</script>

<template>
  <div class="user-center-wrapper">
    <!-- 页面头部导航 -->
    <div class="page-header">
      <el-button class="back-button" type="primary" plain size="small" icon="ArrowLeft" @click="$router.push('/')">
        返回首页
      </el-button>
      <h2 class="page-title">个人中心</h2>
    </div>

    <!-- 用户信息卡片区域 -->
    <div class="user-info-section">
      <user-info-card :loading="loading" @edit="openEditDialog" />
    </div>

    <!-- 分为两列布局的主要内容区域 -->
    <div class="two-column-layout">
      <!-- 左侧列 - 订单相关 -->
      <div class="left-column">
        <!-- 订单快捷方式 -->
        <div class="module-container">
          <order-shortcuts />
        </div>

        <!-- 统计数据 -->
        <div class="module-container">
          <order-statistics :loading="statisticsLoading" :order-statistics="orderStatistics" />
        </div>
      </div>

      <!-- 右侧列 - 地址和收藏 -->
      <div class="right-column">
        <!-- 地址列表 -->
        <div class="module-container">
          <user-address-list :loading="addressLoading" />
        </div>

        <!-- 收藏列表 - 确保宽度足够显示三个商品卡片 -->
        <div class="module-container favorites-container">
          <user-favorites-list :loading="favoritesLoading" />
        </div>
      </div>
    </div>

    <!-- 用户编辑表单 -->
    <user-edit-form v-model:visible="editDialogVisible" :user-info="userInfo" @refresh="refreshUserInfo" />
  </div>
</template>

<style scoped>
/* 全局样式 */
.user-center-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.back-button {
  margin-right: 15px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

/* 用户信息区域 */
.user-info-section {
  margin-bottom: 20px;
}

/* 两列布局 */
.two-column-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.left-column {
  flex: 1.6;
  /* 增加左栏宽度占比 */
  min-width: 0;
  /* 防止内容溢出 */
}

.right-column {
  flex: 1;
  /* 右栏宽度保持不变 */
  min-width: 0;
  /* 防止内容溢出 */
}

/* 模块容器 */
.module-container {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 收藏容器特殊处理 */
.favorites-container {
  /* 确保收藏列表有足够空间显示三个商品卡片 */
  width: 100%;
}

/* 使组件内部样式与外部容器协调 */
.module-container :deep(.section-card) {
  /* 去除组件自带的卡片样式，由外部容器统一提供 */
  box-shadow: none;
  border-radius: 0;
  margin-bottom: 0;
}

/* 响应式布局 */
@media screen and (max-width: 992px) {
  .two-column-layout {
    flex-direction: column;
  }

  .left-column,
  .right-column {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .user-center-wrapper {
    padding: 15px;
  }

  .page-header {
    margin-bottom: 15px;
  }

  .module-container {
    margin-bottom: 15px;
  }
}

@media screen and (max-width: 480px) {
  .user-center-wrapper {
    padding: 10px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>