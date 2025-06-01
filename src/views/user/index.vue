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
  <div class="user-center-container">
    <!-- 添加返回按钮 -->
    <div class="back-button">
      <el-button type="text" icon="ArrowLeft" @click="$router.push('/')">返回首页</el-button>
    </div>

    <!-- 用户信息卡片 -->
    <user-info-card :loading="loading" @edit="openEditDialog" />

    <!-- 订单快捷入口 -->
    <order-shortcuts />

    <!-- 我的地址 -->
    <user-address-list :loading="addressLoading" />

    <!-- 我的收藏 -->
    <user-favorites-list :loading="favoritesLoading" />

    <!-- 订单数据统计 -->
    <order-statistics :loading="statisticsLoading" :order-statistics="orderStatistics" />

    <!-- 用户编辑表单 -->
    <user-edit-form v-model:visible="editDialogVisible" :user-info="userInfo" @refresh="refreshUserInfo" />
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
</style>