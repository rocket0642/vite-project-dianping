import { createRouter, createWebHashHistory } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import adminRoutes from './admin'

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
    path: '/forget-password',
    component: () => import('../views/auth/forget-password.vue'),
    meta: { title: '忘记密码' }
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
  },
  {
    path: '/user/favorites',
    component: () => import('../views/user/favorites.vue'),
    meta: {
      title: '我的收藏',
      requiresAuth: true
    }
  },
  {
    path: '/order/after-sale/:id',
    name: 'AfterSaleDetail',
    component: () => import('../views/order/after-sale-detail.vue'),
    meta: {
      requiresAuth: true,
      title: '售后详情'
    }
  },
  {
    path: '/order/result',
    name: 'PayResult',
    component: () => import('../views/order/result.vue'),
    meta: {
      title: '支付结果',
      requiresAuth: true
    }
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...routes, ...adminRoutes]
})

/**
 * 全局前置守卫
 * 处理页面标题和权限验证
 */
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 点评电商` : '点评电商'


  // 检查是否从登录页面跳转过来，需要合并购物车
  if (from.path === '/login' && to.path !== '/login') {
    const userStore = useUserStore()
    const cartStore = useCartStore()

    // 判断用户是否已登录，且是否需要合并购物车
    if (userStore.isLogin && localStorage.getItem('guest-cart')) {
      try {
        // 合并游客购物车到用户购物车
        await cartStore.mergeGuestCart()
      } catch (error) {
        console.error('合并购物车失败:', error)
      }
    }
  }

  // 检查是否需要管理员权限
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAdmin) {
    const userStore = useUserStore()

    if (!userStore.isLogin) {
      // 未登录时重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    } else if (!userStore.isAdmin) {
      // 已登录但不是管理员
      next({ path: '/403' })
      return
    }
  }
  // 普通权限验证
  else if (to.meta.requiresAuth) {
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