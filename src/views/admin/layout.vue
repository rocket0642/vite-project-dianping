<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="logo">后台管理系统</div>
      <el-menu
        router
        :default-active="$route.path"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
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
          <el-icon><List /></el-icon>
          <span>订单管理</span>
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
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { DataLine, User, Goods, List, ArrowDown } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

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
  width: 240px;
  height: 100%;
  background-color: #304156;
  color: white;
  overflow-y: auto;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
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
</style>
