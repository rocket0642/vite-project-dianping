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

/**
 * 请求拦截器
 * 在请求发送前添加token到请求头
 */
request.interceptors.request.use(
  config => {
    // 从useUserStore获取token
    const userStore = useUserStore()

    // 检查token是否存在
    if (userStore.token) {
      // 检查token是否过期
      if (userStore.isTokenExpired()) {
        // 先清除用户数据，不要在这里跳转
        userStore.clearUserData()
        return Promise.reject(new Error('Token已过期'))
      }

      // token有效，添加到请求头
      config.headers['Authorization'] = userStore.token

      // 刷新token过期时间
      userStore.refreshTokenExpireTime()
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
    const { data } = response

    // 每次成功响应也刷新token过期时间
    const userStore = useUserStore()
    if (userStore.token) {
      userStore.refreshTokenExpireTime()
    }

    // 直接返回完整响应数据，包括success和data字段
    // 这样在组件中可以通过res.success判断请求是否成功
    return data
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      // 只清除数据，不立即跳转
      userStore.clearUserData()
      // 不在拦截器中进行跳转
      return Promise.reject({ ...error, isAuthError: true })
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