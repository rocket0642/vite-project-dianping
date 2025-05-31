import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useUserStore } from '../stores/user'
import { nextTick } from 'vue'
import { getDeviceId } from './deviceFingerprint'

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

// 避免重复重定向
let isRedirecting = false;

/**
 * 请求拦截器
 * 在请求发送前添加token到请求头
 */
request.interceptors.request.use(
  config => {
    // 从useUserStore获取token
    const userStore = useUserStore()

    // 添加设备指纹信息到请求头
    config.headers['X-Device-ID'] = getDeviceId()

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
    return response.data
  },
  async error => {
    // 处理401错误(未授权/token过期)
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      const currentPath = router.currentRoute.value.fullPath

      console.log('收到401错误，准备刷新token')

      // 避免重复重定向
      if (isRedirecting) {
        return Promise.reject(error)
      }

      // 保存原始请求的配置
      const originalRequest = error.config

      // 如果当前没有刷新操作
      if (!isRefreshing) {
        isRefreshing = true
        console.log('开始刷新token...')

        try {
          const response = await userStore.refreshAccessToken()
          console.log('刷新token结果:', response)

          if (response.success) {
            console.log('刷新token成功，重新发送队列中的请求')

            // 复制并清空队列
            const requests = [...pendingRequests]
            pendingRequests = []

            // 执行所有等待的请求
            requests.forEach(cb => cb())

            // 重新发送当前失败的请求
            console.log('重新发送当前请求:', originalRequest.url)
            originalRequest.headers['Authorization'] = userStore.token
            return axios(originalRequest).then(res => res.data)
          } else {
            console.log('刷新token失败，清除用户数据并跳转登录页')
            pendingRequests = []
            userStore.clearUserData()
            isRedirecting = true
            ElMessage.error(response.errorMsg || '登录已过期，请重新登录')

            nextTick(() => {
              router.replace('/login?redirect=' + encodeURIComponent(currentPath))
              isRedirecting = false
            })

            return Promise.reject(new Error('刷新令牌失败'))
          }
        } catch (refreshError) {
          console.error('刷新token过程出错:', refreshError)
          pendingRequests = []
          userStore.clearUserData()
          isRedirecting = true
          ElMessage.error('登录已过期，请重新登录')

          nextTick(() => {
            router.replace('/login?redirect=' + encodeURIComponent(currentPath))
            isRedirecting = false
          })

          return Promise.reject(refreshError)
        } finally {
          console.log('刷新token流程结束')
          isRefreshing = false
        }
      }

      // 将当前请求加入队列
      return new Promise((resolve, reject) => {
        console.log('将失败的请求加入队列，等待token刷新后重试')
        pendingRequests.push(() => {
          console.log('使用新token重新发送请求:', originalRequest.url)
          originalRequest.headers['Authorization'] = userStore.token

          // 使用axios重新请求，并直接返回data部分
          axios(originalRequest)
            .then(res => resolve(res.data))
            .catch(err => reject(err))
        })
      })
    }

    // 处理其他错误
    ElMessage.error(error.response?.data?.errorMsg || '请求失败，请稍后重试')
    return Promise.reject(error)
  }
)

export default request