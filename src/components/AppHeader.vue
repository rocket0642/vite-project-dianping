<script setup>
import { HomeFilled, ShoppingCart } from '@element-plus/icons-vue'
import { ElBadge, ElButton } from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import SearchBar from './SearchBar.vue'

// 路由实例
const router = useRouter()

// 状态管理
const userStore = useUserStore()
const cartStore = useCartStore()

// 购物车商品数量
const cartCount = computed(() => cartStore.totalCount)

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  router.push('/login')
}

/**
 * 跳转到个人中心
 */
const goToUserCenter = () => {
  if (userStore.isLogin) {
    router.push('/user')
  } else {
    router.push('/login?redirect=/user')
  }
}

/**
 * 跳转到首页
 */
const goToHome = () => {
  router.push('/')
}

/**
 * 跳转到购物车
 */
const goToCart = () => {
  router.push('/cart')
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="logo" @click="goToHome">点评网</div>
      <div class="nav-links">
        <el-button type="primary" :icon="HomeFilled" plain @click="goToHome">首页</el-button>
      </div>
      <SearchBar />
      <div class="user-actions">
        <!-- 购物车按钮 -->
        <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
          <el-button type="primary" :icon="ShoppingCart" plain @click="goToCart">
            购物车
          </el-button>
        </el-badge>

        <div class="user-avatar-container">
          <div v-if="userStore.isLogin" class="avatar-wrapper">
            <div class="user-info" @click="goToUserCenter">
              <el-avatar :size="32" :src="userStore.userInfo.icon || defaultAvatar"></el-avatar>
              <span class="username">{{ userStore.userInfo.nickName || userStore.userPhone }}</span>
            </div>
            <!-- 返回管理员页面 -->
            <el-button v-if="userStore.isAdmin" type="primary" @click="router.push('/admin')">
              管理员
            </el-button>
          </div>
          <div v-else class="login-btns">
            <el-button size="small" @click="goToLogin">登录</el-button>
            <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 顶部导航栏样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  cursor: pointer;
  transition: color 0.3s;
}

.logo:hover {
  color: #66b1ff;
}

.nav-links {
  margin-left: 20px;
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-avatar-container {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.el-avatar {
  margin-right: 8px;
}

.username {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.login-btns {
  display: flex;
  gap: 8px;
}

.cart-badge {
  margin-right: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px;
  }

  .logo {
    margin-bottom: 10px;
    margin-right: 10px;
  }

  .nav-links {
    margin-bottom: 10px;
  }

  .cart-badge {
    margin-right: 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>

<script>
const defaultAvatar = '/path/to/default-avatar.png'; // 设置默认头像路径
</script>