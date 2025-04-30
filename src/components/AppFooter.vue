<script setup>
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

/**
 * 跳转到首页
 */
const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-links">
        <a @click="goToHome">首页</a>
        <a href="#">关于我们</a>
        <a href="#">联系我们</a>
        <a href="#">用户协议</a>
        <a href="#">隐私政策</a>
      </div>
      <div class="copyright">
        © {{ new Date().getFullYear() }} 点评网 All Rights Reserved
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* 底部导航样式 */
.footer {
  background-color: #f5f5f5;
  padding: 30px 0;
  margin-top: 30px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 15px;
}

.footer-links a {
  margin: 0 15px;
  color: #666;
  transition: color 0.3s;
  cursor: pointer;
}

.footer-links a:hover {
  color: #409EFF;
}

.copyright {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-links a {
    margin: 0 8px;
    font-size: 14px;
  }
  
  .copyright {
    font-size: 12px;
  }
}
</style>