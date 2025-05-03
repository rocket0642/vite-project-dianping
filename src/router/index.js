import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

/**
 * 路由配置
 * 使用路由懒加载提高性能
 */
const routes = [
  {
    path: '/',
    component: () => import('../views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    component: () => import('../views/auth/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    component: () => import('../views/auth/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/user',
    component: () => import('../views/user/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/user/address',
    name: 'UserAddress',
    component: () => import('../views/user/address.vue'),
    meta: {
      requiresAuth: true,
      title: '收货地址管理'
    }
  },
  {
    path: '/shop/:id',
    component: () => import('../views/shop/detail.vue'),
    meta: { title: '商铺详情' }
  },
  {
    path: '/search',
    component: () => import('../views/shop/search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/shop/type/:typeId',
    component: () => import('../views/shop/type.vue'),
    meta: { title: '分类商铺' }
  },
  {
    path: '/product/:id',
    component: () => import('../views/product/detail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/cart',
    component: () => import('../views/cart/index.vue'),
    meta: { title: '购物车', requiresAuth: false }
  },
  {
    path: '/order/create',
    component: () => import('../views/order/create.vue'),
    meta: { title: '创建订单', requiresAuth: true }
  },
  {
    path: '/order/pay/:id',
    name: 'OrderPay',
    component: () => import('../views/order/pay.vue'),
    meta: {
      requiresAuth: true,
      title: '订单支付'
    }
  },
  {
    path: '/order/list',
    component: () => import('../views/order/list.vue'),
    meta: { title: '订单列表', requiresAuth: true }
  },
  {
    path: '/order/detail/:id',
    component: () => import('../views/order/detail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  // {
  //   path: '/voucher/:shopId',
  //   component: () => import('../views/voucher/index.vue'),
  //   meta: { title: '优惠券' }
  // },
  // {
  //   path: '/voucher/seckill/:id',
  //   component: () => import('../views/voucher/seckill.vue'),
  //   meta: { title: '秒杀优惠券' }
  // },
  // {
  //   path: '/user/info/:id',
  //   component: () => import('../views/user/info.vue'),
  //   meta: { title: '用户详情' }
  // },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/404.vue'),
    meta: { title: '页面不存在' }
  },
  {
    path: '/order/after-sale/:id',
    name: 'OrderAfterSale',
    component: () => import('../views/order/after-sale.vue')
  },
  {
    path: '/order/logistics/:id',
    name: 'OrderLogistics',
    component: () => import('../views/order/logistics.vue')
  },
  {
    path: '/order/comment/:id',
    component: () => import('../views/order/comment.vue'),
    meta: { title: '订单评价', requiresAuth: true }
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置守卫
 * 处理页面标题和权限验证
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 点评电商` : '点评电商'
  
  // 权限验证
  if (to.meta.requiresAuth) {
    // 使用 Pinia Store 获取用户状态
    const userStore = useUserStore()
    
    if (!userStore.isLogin) {
      // 未登录时重定向到登录页，并携带重定向信息
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
  }
  next()
})

export default router