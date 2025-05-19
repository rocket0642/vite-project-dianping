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
    if (error.response.status === 401) {
      // Access Token过期，尝试刷新
      try {
        const userStore = useUserStore()
        const response = await userStore.refreshAccessToken()
        if (response.success) {
          error.config.headers['Authorization'] = response.data.accessToken
          return await axios(error.config)
        }
      } catch (error) {
        ElMessage.error('登录状态已过期，请重新登录')
        // 刷新失败，跳转到登录页
        router.push('/login')
      }
    }
    return Promise.reject(error);
  }
);

export default request