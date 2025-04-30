<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import { ElButton, ElBadge } from 'element-plus'
import { ShoppingCart, HomeFilled } from '@element-plus/icons-vue'
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
        
        <template v-if="userStore.isLogin">
          <div class="user-info" @click="goToUserCenter">
            <img :src="userStore.userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" alt="用户头像" class="avatar">
            <span>{{ userStore.userInfo.nickName || '用户' }}</span>
          </div>
        </template>
        <template v-else>
          <el-button type="primary" @click="goToLogin">登录/注册</el-button>
        </template>
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

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
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
</style>