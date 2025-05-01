import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

/**
 * 创建axios实例，配置基础URL和超时时间
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

/**
 * 请求拦截器
 * 在请求发送前添加token到请求头
 */
request.interceptors.request.use(
  config => {
    // 从pinia持久化存储中获取token
    const userStore = JSON.parse(localStorage.getItem('user-store') || '{}')
    if (userStore.token) {
      config.headers['Authorization'] = userStore.token
    }
    console.log(config.headers['Authorization'])
    return config
  },
  error => Promise.reject(error)
)

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
request.interceptors.response.use(
  response => {
    const { data } = response
    
    // 直接返回完整响应数据，包括success和data字段
    // 这样在组件中可以通过res.success判断请求是否成功
    return data
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地token
      localStorage.removeItem('token')
      // 跳转到登录页
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response && error.response.data && error.response.data.errorMsg) {
      // 显示后端返回的错误信息
      ElMessage.error(error.response.data.errorMsg)
    } else {
      // 显示通用错误信息
      ElMessage.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request