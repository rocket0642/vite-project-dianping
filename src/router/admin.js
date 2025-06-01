import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 后台管理系统路由配置
 */
const adminRoutes = [
    {
        path: '/admin',
        component: () => import('../views/admin/layout.vue'),
        redirect: '/admin/dashboard',
        meta: {
            title: '后台管理系统',
            requiresAdmin: true
        },
        children: [
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('../views/admin/dashboard/index.vue'),
                meta: {
                    title: '仪表盘',
                    icon: 'dashboard'
                }
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: () => import('../views/admin/user/index.vue'),
                meta: {
                    title: '用户管理',
                    icon: 'user'
                }
            },
            {
                path: 'products',
                name: 'ProductManagement',
                component: () => import('../views/admin/product/index.vue'),
                meta: {
                    title: '商品管理',
                    icon: 'shopping'
                }
            },
            {
                path: 'orders',
                name: 'OrderManagement',
                component: () => import('../views/admin/order/index.vue'),
                meta: {
                    title: '订单管理',
                    icon: 'list'
                }
            },
            {
                path: 'shops',
                name: 'ShopManagement',
                component: () => import('../views/admin/shop/index.vue'),
                meta: {
                    title: '商铺管理',
                    icon: 'shop'
                }
            },
            {
                path: 'after-sale',
                name: 'AfterSaleManagement',
                component: () => import('../views/admin/after-sale/index.vue'),
                meta: {
                    title: '售后管理',
                    icon: 'service'
                }
            }
        ]
    },
    // {
    //     path: '/403',
    //     component: () => import('../views/error/403.vue'),
    //     meta: { title: '无权限访问' }
    // }
]

export default adminRoutes