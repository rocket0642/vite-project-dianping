<script setup>
import { Box, ChatDotRound, Document, Edit, Location, Money, Plus, Van, StarFilled } from '@element-plus/icons-vue'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  ElAvatar, ElButton,
  ElDatePicker,
  ElDialog, ElForm, ElFormItem,
  ElIcon,
  ElInput,
  ElMessage, ElMessageBox,
  ElRadio, ElRadioGroup,
  ElSkeleton, ElSkeletonItem,
  ElTag,
  ElUpload
} from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { updateUserDetail, updateUserInfo } from '../../api/user'
import { useAddressStore } from '../../stores/address'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { useFravoriteStore } from '../../stores/fravorite'
import ShopCard from '../../components/ShopCard.vue'

// 注册 ECharts 需要的组件
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
])

// 路由实例
const router = useRouter()

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

// 统一编辑表单数据
const editForm = ref({
  // 基本信息
  nickName: '',
  icon: '',
  city: '',
  introduce: '',
  gender: true,
  birthday: '',
  email: '',
  iconFile: null
})

// 地址数据
const addresses = ref([])

// 订单统计数据
const orderStatistics = ref({
  orderStatus: [],
  monthlySpending: [],
  totalOrders: 0,
  totalAmount: 0
})

// 收藏数据
const recentFavorites = computed(() => favoriteStore.favoriteList.slice(0, 3))

// 图表实例引用
const orderStatusChartRef = ref(null)
const monthlySpendingChartRef = ref(null)
let orderStatusChart = null
let monthlySpendingChart = null

/**
 * 加载用户地址
 */
const loadUserAddresses = async () => {
  try {
    addressLoading.value = true
    // 使用store的方法获取地址
    await addressStore.fetchAddresses()
    // 仍然保留只显示前3个地址的逻辑
    addresses.value = addressStore.addressList.slice(0, 3)
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
  try {
    statisticsLoading.value = true
    const res = await orderStore.fetchOrderStatistics()
    if (res.success) {
      orderStatistics.value = res.data
      // 在数据加载完成后初始化图表
      setTimeout(() => {
        initOrderStatusChart()
        initMonthlySpendingChart()
      }, 100)
    }
  } catch (error) {
    console.error('获取订单统计数据失败:', error)
  } finally {
    statisticsLoading.value = false
  }
}

/**
 * 初始化订单状态饼图
 */
const initOrderStatusChart = () => {
  // 确保DOM元素已经渲染
  if (!orderStatusChartRef.value) return

  // 如果图表已经存在，则销毁重建
  if (orderStatusChart) {
    orderStatusChart.dispose()
  }

  // 创建图表实例
  orderStatusChart = echarts.init(orderStatusChartRef.value)

  // 准备数据
  const statusData = orderStatistics.value.orderStatus.filter(item => item.value > 0)

  // 设置图表配置
  const option = {
    title: {
      text: '订单状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: statusData.map(item => item.name)
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: statusData.map(item => ({
          value: item.value,
          name: item.name
        }))
      }
    ]
  }

  // 应用配置
  orderStatusChart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    orderStatusChart && orderStatusChart.resize()
  })
}

/**
 * 初始化月度消费趋势折线图
 */
const initMonthlySpendingChart = () => {
  // 确保DOM元素已经渲染
  if (!monthlySpendingChartRef.value) return

  // 如果图表已经存在，则销毁重建
  if (monthlySpendingChart) {
    monthlySpendingChart.dispose()
  }

  // 创建图表实例
  monthlySpendingChart = echarts.init(monthlySpendingChartRef.value)

  // 准备数据
  const days = orderStatistics.value.monthlySpending.map(item => item.day)
  const amounts = orderStatistics.value.monthlySpending.map(item => item.amount)

  // 设置图表配置
  const option = {
    title: {
      text: '近14天消费趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 元'
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        formatter: value => value.split('-')[2] + '日'
      }
    },
    yAxis: {
      type: 'value',
      name: '消费金额(元)'
    },
    series: [
      {
        data: amounts,
        type: 'line',
        smooth: true,
        name: '消费金额',
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }

  // 应用配置
  monthlySpendingChart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    monthlySpendingChart && monthlySpendingChart.resize()
  })
}

/**
 * 打开编辑对话框
 */
const openEditDialog = () => {
  console.log('当前用户信息:', userInfo.value) // 添加日志

  // 统一设置所有用户信息
  editForm.value = {
    // 基本信息
    nickName: userInfo.value.nickName || '',
    icon: userInfo.value.icon || '',
    city: userInfo.value.city || '',
    introduce: userInfo.value.introduce || '',
    gender: userInfo.value.gender !== undefined ? userInfo.value.gender : false,
    birthday: userInfo.value.birthday || '',
    email: userInfo.value.email || '',
    iconFile: null
  }

  console.log('填充到表单的信息:', editForm.value) // 添加日志
  editDialogVisible.value = true
}

/**
 * 处理图片上传
 * @param {Object} file - 上传的文件对象
 */
const handleAvatarChange = (file) => {
  // 创建一个临时URL用于预览
  if (file.raw) {
    // 检查文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.raw.type)) {
      ElMessage.error('只能上传JPG/PNG/GIF格式的图片！')
      return false
    }
    // 检查文件大小
    if (file.raw.size / 1024 / 1024 > 2) {
      ElMessage.error('图片大小不能超过2MB！')
      return false
    }

    // 创建临时URL预览图片
    editForm.value.icon = URL.createObjectURL(file.raw)
    ElMessage.success('头像已选择')

    // 这里可以保存文件对象以便后续处理
    editForm.value.iconFile = file.raw
    return false // 阻止自动上传
  }
}

/**
 * 提交编辑表单
 */
const submitEditForm = async () => {
  try {
    // 如果有新上传的头像文件，处理文件上传
    if (editForm.value.iconFile) {
      // 1. 如果有原头像，先删除原头像
      if (userInfo.value.icon) {
        try {
          // 调用删除图片API
          const deleteRes = await userStore.uploadUserDelete(userInfo.value.icon)
          if (deleteRes.success) {
            console.log('原头像删除成功')
          } else {
            console.warn('原头像删除失败:', deleteRes.errorMsg)
          }
        } catch (error) {
          console.error('删除原头像出错:', error)
        }
      }

      // 2. 上传新头像
      const formData = new FormData()
      formData.append('file', editForm.value.iconFile)
      formData.append('type', 'icon')

      // 调用API上传头像
      const uploadRes = await userStore.uploadUserSave(formData)
      if (uploadRes.success) {
        // 更新表单中的头像URL为服务器返回的URL
        editForm.value.icon = uploadRes.data
      } else {
        ElMessage.error('头像上传失败')
        return
      }
    }

    // 更新基本信息
    await updateUserInfo({
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
  router.push(`/order/list?status=${status}&fromUserCenter=true`)
}

/**
 * 跳转到地址管理页面
 */
const goToAddressManage = () => {
  router.push('/user/address')
}

/**
 * 退出登录
 */
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userStore.logout()
      // 主动登出时直接跳转到登录页，不带重定向参数
      router.push('/login')
      ElMessage.success('退出登录成功')
    } catch (error) {
      // 即使登出失败也强制清除数据并跳转
      userStore.clearUserData()
      router.push('/login')
      ElMessage.error('登出过程中出错，已强制登出')
    }
  }).catch(() => { })
}

/**
 * 加载用户收藏
 */
const loadUserFavorites = async () => {
  try {
    if (!userStore.isLogin) {
      return;
    }
    favoritesLoading.value = true;
    await favoriteStore.getFavoriteList();
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  } finally {
    favoritesLoading.value = false;
  }
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

    // 然后并行加载其他数据
    await Promise.all([
      loadUserAddresses(),
      loadOrderStatistics(),
      loadUserFavorites()
    ])
  } catch (error) {
    console.error('加载用户中心数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
})

// 监听对话框显示状态，确保每次打开都重新获取最新用户数据
watch(() => editDialogVisible.value, (newVal) => {
  if (newVal) {
    // 如果对话框打开，强制同步最新用户信息到表单
    editForm.value = {
      nickName: userInfo.value.nickName || '',
      icon: userInfo.value.icon || '',
      city: userInfo.value.city || '',
      introduce: userInfo.value.introduce || '',
      gender: userInfo.value.gender !== undefined ? userInfo.value.gender : false,
      birthday: userInfo.value.birthday || '',
      email: userInfo.value.email || '',
      iconFile: null
    }
  }
})

// 组件卸载时清理图表实例
onUnmounted(() => {
  if (orderStatusChart) {
    orderStatusChart.dispose()
    orderStatusChart = null
  }
  if (monthlySpendingChart) {
    monthlySpendingChart.dispose()
    monthlySpendingChart = null
  }

  // 移除事件监听
  window.removeEventListener('resize', () => { })
})

/**
 * 图片上传前的处理
 */
const beforeAvatarUpload = (file) => {
  // 检查文件类型
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
    ElMessage.error('只能上传JPG/PNG/GIF格式的图片！')
    return false
  }
  // 检查文件大小
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过2MB！')
    return false
  }
  return true
}
</script>

<template>
  <div class="user-center-container">
    <!-- 添加返回按钮 -->
    <div class="back-button">
      <el-button type="text" icon="ArrowLeft" @click="$router.push('/')">返回首页</el-button>
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
              <el-avatar :size="100"
                :src="userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            </div>
            <div class="user-basic-info">
              <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
              <div class="edit-btn-container">
                <el-button type="primary" size="small" @click="openEditDialog" class="edit-btn">
                  <el-icon>
                    <Edit />
                  </el-icon>
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
      <div class="order-shortcuts">
        <div class="shortcut-item" @click="goToOrderList(0)">
          <el-icon>
            <Document />
          </el-icon>
          <span class="shortcut-label">全部订单</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(2)">
          <el-icon>
            <Box />
          </el-icon>
          <span class="shortcut-label">已支付</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(1)">
          <el-icon>
            <Money />
          </el-icon>
          <span class="shortcut-label">待付款</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(3)">
          <el-icon>
            <Document />
          </el-icon>
          <span class="shortcut-label">已取消</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(4)">
          <el-icon>
            <Van />
          </el-icon>
          <span class="shortcut-label">待收货</span>
        </div>
        <div class="shortcut-item" @click="goToOrderList(5)">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <span class="shortcut-label">待评价</span>
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
            <el-icon>
              <Location />
            </el-icon>
            <p>您还没有添加收货地址</p>
            <el-button type="primary" size="small" @click="goToAddressManage">添加地址</el-button>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 我的收藏 -->
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">我的收藏</h3>
        <el-button type="text" @click="$router.push('/user/favorites')">查看全部</el-button>
      </div>

      <el-skeleton :loading="favoritesLoading" animated :count="3">
        <template #template>
          <div class="skeleton-favorites">
            <el-skeleton-item variant="image" style="width: 100%; height: 120px; margin-bottom: 8px;" />
            <el-skeleton-item variant="text" style="width: 60%; height: 16px;" />
          </div>
        </template>

        <template #default>
          <div v-if="recentFavorites.length > 0" class="favorites-grid">
            <shop-card v-for="shop in recentFavorites" :key="shop.id" :shop="shop" />
          </div>
          <div v-else class="empty-favorites">
            <el-icon><star-filled /></el-icon>
            <p>您还没有收藏任何商铺</p>
            <el-button type="primary" size="small" @click="$router.push('/')">去浏览商铺</el-button>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 订单数据统计 -->
    <div class="section-card">
      <h3 class="section-title">数据统计</h3>
      <el-skeleton :loading="statisticsLoading" animated>
        <template #template>
          <div class="skeleton-statistics">
            <div class="skeleton-chart">
              <el-skeleton-item variant="p" style="width: 100%; height: 300px;" />
            </div>
            <div class="skeleton-chart">
              <el-skeleton-item variant="p" style="width: 100%; height: 300px;" />
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="orderStatistics.totalOrders === 0" class="empty-statistics">
            <el-icon>
              <Document />
            </el-icon>
            <p>暂无订单数据</p>
          </div>
          <div v-else class="statistics-container">
            <div class="statistics-summary">
              <div class="summary-item">
                <div class="summary-value">{{ orderStatistics.totalOrders }}</div>
                <div class="summary-label">总订单数</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">¥{{ (orderStatistics.totalAmount / 100).toFixed(2) }}</div>
                <div class="summary-label">总消费金额</div>
              </div>
            </div>

            <div class="statistics-charts">
              <div ref="orderStatusChartRef" class="chart-container"></div>
              <div ref="monthlySpendingChartRef" class="chart-container"></div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 统一的编辑信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人信息" width="500px">
      <el-form :model="editForm" label-width="80px">
        <!-- 基本信息 -->
        <h4 class="form-section-title">基本信息</h4>
        <el-form-item label="头像">
          <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
            :on-change="handleAvatarChange" :before-upload="beforeAvatarUpload" accept="image/jpeg,image/png,image/gif">
            <img v-if="editForm.icon" :src="editForm.icon" class="avatar">
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
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
          <el-date-picker v-model="editForm.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="个人介绍">
          <el-input v-model="editForm.introduce" type="textarea" :rows="3" placeholder="请输入个人介绍"></el-input>
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

.user-card,
.section-card {
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

.empty-address {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-address p {
  margin: 10px 0;
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

/* 统计图表样式 */
.statistics-container {
  margin-top: 20px;
}

.statistics-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.statistics-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.empty-statistics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #909399;
}

.empty-statistics .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.skeleton-statistics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-chart {
  width: 100%;
}

@media (min-width: 768px) {
  .statistics-charts {
    flex-wrap: nowrap;
  }

  .chart-container {
    width: 50%;
  }
}

@media (max-width: 768px) {
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

  .statistics-summary {
    flex-direction: column;
    gap: 15px;
  }

  .chart-container {
    height: 250px;
  }
}

.avatar-upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 收藏列表样式 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.skeleton-favorites {
  margin-bottom: 15px;
}

.empty-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-favorites .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.empty-favorites p {
  margin: 10px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>