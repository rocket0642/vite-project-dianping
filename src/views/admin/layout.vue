<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="logo">后台管理系统</div>
      <el-menu
        router
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/after-sale">
          <el-icon><Headset /></el-icon>
          <span>售后管理</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <div class="admin-content">
      <div class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="dropdown-link">
              {{ userStore.userInfo?.name || '管理员' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToHome">前台首页</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div class="admin-main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/user'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  Monitor, 
  User, 
  Goods, 
  Document, 
  Headset,
  ArrowDown 
} from '@element-plus/icons-vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const tableHeight = ref(500)

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  return route.path
})

const calcTableHeight = () => {
  // 60(header) + 60(搜索栏) + 60(分页) + 40(边距) 你可以根据实际调整
  tableHeight.value = window.innerHeight - 60 - 60 - 60 - 40
}

onMounted(() => {
  calcTableHeight()
  window.addEventListener('resize', calcTableHeight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', calcTableHeight)
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logout()
    router.push('/login')
  }).catch(() => {})
}

// 前往首页
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.admin-sidebar {
  width: 200px;
  height: 100%;
  background-color: #304156;
  color: white;
  overflow-y: auto;
}

.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b3a4a;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.product-management {
  padding: 0 10px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.el-table {
  flex: 1;
  min-height: 300px;
}

@media (max-width: 900px) {
  .product-management {
    padding: 0 2px;
  }
  .filter-container {
    flex-direction: column;
    gap: 6px;
  }
  .el-table th, .el-table td {
    font-size: 12px;
    padding: 4px 2px;
  }
  .el-button, .el-input, .el-select {
    font-size: 12px !important;
    height: 28px !important;
  }
}
</style>
