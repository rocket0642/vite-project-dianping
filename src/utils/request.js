import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useUserStore } from '../stores/user'

/**
 * 创建axios实例，配置基础URL和超时时间
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 存储刷新token的promise，防止多次请求
let isRefreshing = false
let refreshPromise = null
// 存储401请求队列
let pendingRequests = []

/**
 * 请求拦截器
 * 在请求发送前添加token到请求头
 */
request.interceptors.request.use(
  config => {
    // 从useUserStore获取token
    const userStore = useUserStore()

    // 检查token是否存在
    if (userStore.isLogin) {

      // token有效，添加到请求头
      config.headers['Authorization'] = userStore.token

    }

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
    // 检查这里是否正确处理了response.data
    return response.data
  },
  async error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()

      // 获取原始请求配置
      const originalRequest = error.config

      // 如果当前没有刷新操作
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = userStore.refreshAccessToken()
          .then(response => {
            if (response.success) {
              // 刷新成功，遍历队列重新发起请求
              pendingRequests.forEach(cb => cb())
              pendingRequests = []
              return userStore.token
            } else {
              // 刷新失败，拒绝所有队列请求
              pendingRequests.forEach(cb => cb(new Error('刷新令牌失败')))
              pendingRequests = []

              userStore.clearUserData()
              ElMessage.error(response.errorMsg || '登录已过期，请重新登录')
              router.push('/login')
              return Promise.reject(new Error('刷新令牌失败'))
            }
          })
          .catch(error => {
            // 刷新出错，拒绝所有队列请求
            pendingRequests.forEach(cb => cb(error))
            pendingRequests = []

            userStore.clearUserData()
            ElMessage.error('登录已过期，请重新登录')
            router.push('/login')
            return Promise.reject(error)
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })
      }

      // 将当前请求加入队列
      return new Promise((resolve, reject) => {
        pendingRequests.push((error) => {
          if (error) {
            reject(error)
          } else {
            // 使用新token重试请求
            originalRequest.headers['Authorization'] = userStore.token
            resolve(request(originalRequest))
          }
        })

        // 等待刷新token结果
        refreshPromise.catch(reject)
      })
    }

    return Promise.reject(error)
  }
)

export default request