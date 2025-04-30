# 电商点评项目前端构建步骤

## 1. 环境搭建与项目初始化

### 1.1 创建Vite项目

```bash
# 使用Vite创建Vue3项目
npm create vite@latest vite-project-dianping -- --template vue

# 进入项目目录
cd vite-project-dianping

# 安装依赖
npm install
```

### 1.2 安装必要依赖

```bash
# 安装Vue Router
npm install vue-router@4

# 安装Pinia
npm install pinia

# 安装pinia-plugin-persistedstate (用于持久化存储)
npm install pinia-plugin-persistedstate

# 安装Element Plus
npm install element-plus

# 安装Element Plus图标
npm install @element-plus/icons-vue

# 安装Axios
npm install axios

# 安装Echarts (数据可视化)
npm install echarts

# 安装高德地图API (用于物流路线规划)
npm install @amap/amap-jsapi-loader

# 安装sass预处理器 (用于样式处理)
npm install -D sass

# 安装dayjs (用于日期处理)
npm install dayjs

# 安装mock.js (模拟数据)
npm install mockjs
```

### 1.3 项目目录结构设计

```
├── public                     # 静态资源
├── src                        # 源代码
│   ├── api                    # API接口目录
│   │   ├── user.js            # 用户相关接口
│   │   ├── shop.js            # 商铺相关接口
│   │   ├── voucher.js         # 优惠券相关接口
│   │   ├── goods.js           # 商品相关接口
│   │   └── order.js           # 订单相关接口
│   │   
│   │   
│   ├── assets                 # 静态资源
│   ├── components             # 公共组件
│   │   ├── common             # 通用组件
│   │   ├── business           # 业务组件
│   │   └── layout             # 布局组件
│   ├── router                 # 路由配置
│   ├── stores                 # Pinia状态管理
│   │   ├── user.js            # 用户状态
│   │   ├── cart.js            # 购物车状态
│   │   └── order.js           # 订单状态
│   │   
│   ├── utils                  # 工具函数
│   │   ├── request.js         # Axios请求封装
│   │   ├── auth.js            # 认证相关
│   │   ├── cache.js           # 缓存相关
│   │   └── format.js          # 格式化工具
│   ├── views                  # 页面组件
│   │   ├── auth               # 认证相关页面
│   │   ├── home               # 首页
│   │   ├── shop               # 商铺相关页面
│   │   ├── product            # 商品相关页面
│   │   ├── cart               # 购物车页面
│   │   ├── order              # 订单相关页面
│   │   ├── user               # 用户中心页面
│   │   └── voucher            # 优惠券页面
│   │   
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── vite.config.js             # Vite配置
└── package.json               # 项目配置
```

## 2. 基础配置

### 2.1 统一响应格式处理

后端API返回的统一格式为：

```javascript
{
  "success": true|false,      // 操作是否成功
  "data": object,             // 返回的数据
  "errorMsg": "错误信息",      // 错误提示，success为false时才有
  "total": 100                // 分页查询时的总记录数
}
```

### 2.2 配置Axios请求拦截器

在`src/utils/request.js`中:

```javascript
import axios from 'axios'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    
    // 处理统一响应格式
    if (data.success) {
      // 如果有分页数据，返回包含data和total的对象
      if (data.total !== undefined) {
        return {
          list: data.data,
          total: data.total
        }
      }
      // 否则直接返回数据部分
      return data.data
    } else {
      // 显示错误消息
      ElMessage.error(data.errorMsg || '请求失败')
      return Promise.reject(new Error(data.errorMsg || '请求失败'))
    }
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request
```

### 2.3 配置Vue Router

在`src/router/index.js`中:

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

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
    path: '/user',
    component: () => import('../views/user/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
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
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/order/create',
    component: () => import('../views/order/create.vue'),
    meta: { title: '创建订单', requiresAuth: true }
  },
  {
    path: '/order/pay/:id',
    component: () => import('../views/order/pay.vue'),
    meta: { title: '支付订单', requiresAuth: true }
  },
  {
    path: '/order/list',
    component: () => import('../views/order/list.vue'),
    meta: { title: '订单列表', requiresAuth: true }
  },
  {
    path: '/order/:id',
    component: () => import('../views/order/detail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/voucher/:shopId',
    component: () => import('../views/voucher/index.vue'),
    meta: { title: '优惠券' }
  },
  {
    path: '/voucher/seckill/:id',
    component: () => import('../views/voucher/seckill.vue'),
    meta: { title: '秒杀优惠券' }
  },
  {
    path: '/user/info/:id',
    component: () => import('../views/user/info.vue'),
    meta: { title: '用户详情' }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 点评电商` : '点评电商'
  
  // 鉴权
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
```

### 2.4 配置Pinia状态管理

在`src/main.js`中配置Pinia:

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// 创建Pinia实例
const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
```

### 2.5 用户状态管理

在`src/stores/user.js`中:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCode, getUserInfo } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref({})
  
  const isLogin = computed(() => !!token.value)
  
  // 登录
  async function userLogin(phone, code) {
    try {
      const res = await login(phone, code)
      token.value = res.token
      await fetchUserInfo()
      return res
    } catch (error) {
      throw error
    }
  }
  
  // 获取验证码
  async function fetchCode(phone) {
    return await getCode(phone)
  }
  
  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await getUserInfo()
      userInfo.value = res
      return res
    } catch (error) {
      throw error
    }
  }
  
  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
  }
  
  return {
    token,
    userInfo,
    isLogin,
    userLogin,
    fetchCode,
    fetchUserInfo,
    logout
  }
}, {
  // 持久化配置
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token']
  }
})
```

## 3. 用户认证模块

### 3.1 API接口封装

在`src/api/user.js`中:

```javascript
import request from '../utils/request'

// 获取手机验证码
export function getCode(phone) {
  return request({
    url: '/user/code',
    method: 'post',
    data: { phone }
  })
}

// 用户登录
export function login(phone, code) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { phone, code }
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/user/me',
    method: 'get'
  })
}

// 查询用户详情
export function getUserDetail(id) {
  return request({
    url: `/user/info/${id}`,
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(userInfo) {
  return request({
    url: '/user/info',
    method: 'put',
    data: userInfo
  })
}
```

### 3.2 登录页面

在`src/views/auth/login.vue`中实现:

#### 验证码登录

- 手机号输入框
- 验证码输入框
- 获取验证码按钮（倒计时功能，验证码是随机生成的六位数字，打印到控制台上）
- 登录按钮（判断用户是否存在，不存在提示去注册）
- 使用Element Plus表单校验

#### 密码登录

- 手机号输入框
- 密码输入框
- 登录按钮（判断用户是否存在，不存在提示去注册）
- 使用Element Plus表单校验

### 3.3 注册页面

在`src/views/auth/register.vue`中实现:

- 手机号输入框
- 密码输入框
- 确认密码输入框
- 验证码输入框
- 获取验证码按钮（倒计时功能，验证码是随机生成的六位数字，打印到控制台上，判断用户是否已注册，已注册提示已注册去登录）
- 注册按钮（注册完成跳转到登录界面）
- 使用Element Plus表单校验

## 4. 首页模块

### 4.1 API接口封装

在`src/api/shop.js`中:

```javascript
import request from '../utils/request'

// 获取商铺类型列表
export function getShopTypeList() {
  return request({
    url: '/shop/type/list',
    method: 'get'
  })
}

// 根据类型查询商铺
export function getShopsByType(params) {
  return request({
    url: '/shop/of/type',
    method: 'get',
    params
  })
}

// 获取商铺详情
export function getShopDetail(id) {
  return request({
    url: `/shop/${id}`,
    method: 'get'
  })
}
```

### 4.2 首页组件

在`src/views/home/index.vue`中实现:

- 顶部搜索栏
- 商铺类型导航栏（横向滚动）
- 商铺推荐列表（分类显示）
- 轮播图（展示活动广告）
- 底部导航栏

### 4.3 商铺类型导航组件

在`src/components/business/ShopTypeNav.vue`中:

- 根据后端返回的商铺类型数据动态生成
- 支持横向滑动
- 点击类型跳转到对应的商铺列表

### 4.4 商铺卡片组件

在`src/components/business/ShopCard.vue`中:

- 显示商铺图片、名称、评分、人均消费
- 点击卡片跳转到商铺详情页

## 5. 商铺模块

### 5.1 商铺搜索页面

在`src/views/shop/search.vue`中实现:

- 搜索框
- 筛选条件（类型、区域、评分等）
- 排序选项（距离、好评、销量等）
- 商铺列表展示
- 分页功能

### 5.2 商铺详情页

在`src/views/shop/detail.vue`中实现:

- 基本信息展示（名称、地址、评分、营业时间等）
- 商品列表展示
- 优惠券信息
- 评价列表
- 店铺位置地图
- 收藏功能

## 6. 商品模块

### 6.1 API接口封装

在`src/api/goods.js`中:

```javascript
import request from '../utils/request'

// 获取商品详情
export function getGoodsDetail(id) {
  return request({
    url: `/goods/${id}`,
    method: 'get'
  })
}

// 获取商铺的商品列表
export function getShopGoods(shopId) {
  return request({
    url: '/goods/list',
    method: 'get',
    params: { shopId }
  })
}
```

### 6.2 商品详情页

在`src/views/product/detail.vue`中实现:

- 商品图片轮播
- 商品基本信息（名称、价格、销量等）
- 商品SKU选择
- 商品描述
- 商品评价
- 加入购物车按钮
- 立即购买按钮
- 收藏功能
- 相关商品推荐

### 6.3 商品SKU选择组件

在`src/components/business/SkuSelector.vue`中:

- 支持多规格选择（如颜色、尺寸等）
- 库存和价格联动
- 数量选择器

## 7. 购物车模块

### 7.1 Pinia状态管理

在`src/stores/cart.js`中:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  
  // 计算总价
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      if (item.checked) {
        return sum + item.price * item.count
      }
      return sum
    }, 0)
  })
  
  // 计算已选商品数量
  const checkedCount = computed(() => {
    return cartItems.value.reduce((count, item) => {
      if (item.checked) {
        return count + item.count
      }
      return count
    }, 0)
  })
  
  // 添加商品到购物车
  function addToCart(product, count = 1, sku = {}) {
    const existing = cartItems.value.find(item => 
      item.id === product.id && JSON.stringify(item.sku) === JSON.stringify(sku)
    )
    
    if (existing) {
      existing.count += count
    } else {
      cartItems.value.push({
        ...product,
        count,
        sku,
        checked: true
      })
    }
    
    // 持久化保存
    saveToLocal()
  }
  
  // 移除购物车商品
  function removeFromCart(index) {
    cartItems.value.splice(index, 1)
    saveToLocal()
  }
  
  // 更新商品数量
  function updateItemCount(index, count) {
    if (count < 1) count = 1
    cartItems.value[index].count = count
    saveToLocal()
  }
  
  // 切换商品选中状态
  function toggleItemCheck(index) {
    cartItems.value[index].checked = !cartItems.value[index].checked
    saveToLocal()
  }
  
  // 全选/取消全选
  function toggleAllCheck(checked) {
    cartItems.value.forEach(item => {
      item.checked = checked
    })
    saveToLocal()
  }
  
  // 清空购物车
  function clearCart() {
    cartItems.value = []
    saveToLocal()
  }
  
  // 持久化保存到localStorage
  function saveToLocal() {
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  }
  
  // 从localStorage加载
  function loadFromLocal() {
    const saved = localStorage.getItem('cart')
    if (saved) {
      cartItems.value = JSON.parse(saved)
    }
  }
  
  // 初始化时加载
  loadFromLocal()
  
  return {
    cartItems,
    totalPrice,
    checkedCount,
    addToCart,
    removeFromCart,
    updateItemCount,
    toggleItemCheck,
    toggleAllCheck,
    clearCart
  }
})
```

### 7.2 购物车页面

在`src/views/cart/index.vue`中实现:

- 商品列表展示
- 商品选择功能
- 数量调整
- 删除功能
- 价格计算
- 结算按钮

## 8. 订单模块

### 8.1 API接口封装

在`src/api/order.js`中:

```javascript
import request from '../utils/request'

// 创建订单
export function createOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

// 获取用户订单列表
export function getUserOrders(params) {
  return request({
    url: '/order/of/user',
    method: 'get',
    params
  })
}

// 取消订单
export function cancelOrder(id) {
  return request({
    url: `/order/${id}/cancel`,
    method: 'post'
  })
}

// 确认收货
export function confirmOrder(id) {
  return request({
    url: `/order/${id}/confirm`,
    method: 'post'
  })
}

// 申请退款
export function refundOrder(id, data) {
  return request({
    url: `/order/${id}/refund`,
    method: 'post',
    data
  })
}
```

### 8.2 创建订单页面

在`src/views/order/create.vue`中实现:

- 收货地址选择
- 商品信息确认
- 优惠券选择
- 配送方式选择
- 支付方式选择
- 订单备注
- 价格计算
- 提交订单按钮

### 8.3 支付页面

在`src/views/order/pay.vue`中实现:

- 订单信息展示
- 支付方式选择（模拟）
- 支付按钮
- 倒计时功能（订单超时取消）

### 8.4 订单列表页面

在`src/views/order/list.vue`中实现:

- 订单状态筛选（全部、待付款、待发货、待收货、已完成）
- 订单列表展示
- 订单操作按钮（付款、确认收货、查看物流等）
- 分页功能

### 8.5 订单详情页面

在`src/views/order/detail.vue`中实现:

- 订单状态信息
- 收货地址信息
- 商品信息
- 支付信息
- 物流信息
- 订单操作按钮（根据订单状态显示不同按钮）

### 8.6 订单售后页面

在`src/views/order/after-sale.vue`中实现:

- 申请退款表单
- 上传凭证
- 退款原因选择
- 退款金额输入
- 售后进度查询

## 10. 优惠券模块

### 10.1 API接口封装

在`src/api/voucher.js`中:

```javascript
import request from '../utils/request'

// 获取店铺优惠券
export function getShopVouchers(shopId) {
  return request({
    url: `/voucher/list/${shopId}`,
    method: 'get'
  })
}

// 秒杀优惠券下单
export function seckillVoucher(id) {
  return request({
    url: `/voucher-order/seckill/${id}`,
    method: 'post'
  })
}
```

### 10.2 商铺优惠券页面

在`src/views/voucher/index.vue`中实现:

- 普通优惠券列表
- 秒杀优惠券列表（倒计时展示）
- 领取按钮
- 使用规则展示

### 10.3 秒杀优惠券组件

在`src/components/business/SeckillVoucher.vue`中:

- 倒计时功能
- 抢购按钮
- 库存展示

### 10.4 优惠券使用规则页面

在`src/views/voucher/rules.vue`中实现:

- 优惠券使用规则说明
- 优惠券使用条件
- 优惠券使用注意事项

### 10.5 优惠券订单页面

在`src/views/order/list.vue`中:

- 秒杀优惠券订单列表
- 秒杀优惠券订单状态展示
- 秒杀优惠券订单操作按钮（取消订单、查看物流等）

## 9. 个人中心模块

### 9.1 个人中心页面

在`src/views/user/index.vue`中实现:

- 用户基本信息展示
- 订单快捷入口（待付款、待发货、待收货等）
- 我的地址
- 最近浏览

### 9.2 地址管理页面

在`src/views/user/address.vue`中实现:

- 地址列表
- 新增地址表单
- 编辑地址功能
- 删除地址功能
- 设置默认地址

## 11. 高级功能实现

### 11.1 物流地图API集成

在`src/views/order/logistics.vue`中实现:

- 使用高德地图API
- 发货地到收货地路线规划
- 物流节点标记
- 预计送达时间

### 11.2 Echarts数据统计

在`src/views/user/statistics.vue`中实现:

- 消费金额统计图表
- 订单数量统计图表
- 消费类型饼图
- 年度/月度消费趋势图

### 11.3 商品推荐系统

在`src/components/business/RecommendProducts.vue`中:

- 基于用户浏览历史的推荐
- 基于用户购买记录的推荐
- 热门商品推荐

### 11.4 骨架屏加载效果

在主要页面添加骨架屏组件，提升用户体验:

- 首页骨架屏
- 商品详情骨架屏
- 订单列表骨架屏

### 11.5 PWA支持

添加PWA支持，实现离线访问和添加到主屏幕功能

## 12. 优化与部署

### 12.1 性能优化

- 路由懒加载
- 组件按需导入
- 图片懒加载
- 虚拟列表（长列表优化）

### 12.2 SEO优化

- Meta标签管理
- 服务端渲染考虑

### 12.3 打包与部署

```bash
# 打包生产环境代码
npm run build

# 预览生产环境构建
npm run preview
```

```
