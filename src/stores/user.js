import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCode, getUser, getUserInfo, register } from '../api/user'
import { useCartStore } from './cart'

/**
 * 用户状态管理
 * 使用Pinia管理用户登录状态、token和用户信息
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref({})
  const userPhone = ref(null)
  const tokenExpireTime = ref(null) // Token过期时间
  const tokenTimer = ref(null) // 定时器引用
  // token时效
  const TOKEN_EXPIRE_TIME = 10 * 60 * 1000 // 10分钟
  // 计算属性
  const isLogin = computed(() => !!token.value)
  
  /**
   * 设置Token过期时间（10分钟）
   */
  function setTokenExpireTime() {
    // 设置10分钟后过期
    tokenExpireTime.value = Date.now() + TOKEN_EXPIRE_TIME
    
    // 清除旧定时器
    if (tokenTimer.value) {
      clearTimeout(tokenTimer.value)
    }
    
    // 设置新定时器
    tokenTimer.value = setTimeout(() => {
      // 时间到，自动登出
      if (token.value) {
        console.log('Token已过期，自动登出')
        logout()
      }
    }, TOKEN_EXPIRE_TIME)
  }
  
  /**
   * 刷新Token过期时间
   */
  function refreshTokenExpireTime() {
    if (token.value) {
      setTokenExpireTime()
    }
  }
  
  /**
   * 验证码登录
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @param {string} password - 密码
   * @returns {Promise} - 登录结果
   */
  async function userLogin(phone, code, password) {
    try {
      const res = await login(phone, code, password)
      if (res.success) {
        token.value = res.data
        userPhone.value = phone
        // 设置Token过期时间
        setTokenExpireTime()
        await fetchUserInfo()
        // 登录成功后重新加载购物车数据
        const cartStore = useCartStore()
        if (cartStore) {
          cartStore.switchUserCart(userPhone.value)
        }
      }
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 注册
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @param {string} password - 密码
   * @returns {Promise} - 注册结果
   */
  async function userRegister(data) {
    try {
      const res = await register(data)
      return res
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 获取验证码
   * @param {string} phone - 手机号
   * @returns {Promise} - 获取验证码结果
   */
  async function fetchCode(phone) {
    return await getCode(phone)
  }
  
  /**
   * 获取用户信息
   * @returns {Promise} - 用户信息
   */
  async function fetchUserInfo() {
    try {
      if (Object.keys(userInfo.value).length > 0) {
        return userInfo.value
      }
      const res1 = await getUser()
      const res2 = await getUserInfo(res1.data.id)
      const res = {
        success: res1.success,
        data: {
          ...res1.data,
          ...res2.data
        }
      }
      if (res.success) {
        userInfo.value = res.data
      }
      return res
    } catch (error) {
      throw error
    }
  }
  
  /**
   * 退出登录
   */
  function logout() {
    // 清除token和相关数据
    token.value = ''
    userInfo.value = {}
    userPhone.value = null
    tokenExpireTime.value = null
    
    // 清除定时器
    if (tokenTimer.value) {
      clearTimeout(tokenTimer.value)
      tokenTimer.value = null
    }
    
    // 清除user-store
    sessionStorage.removeItem('user-store')

    // 退出登录后重新加载购物车数据（切换到游客购物车）
    const cartStore = useCartStore()
    if (cartStore) {
      cartStore.switchUserCart(null)
    }
  }
  
  /**
   * 检查Token是否过期
   * @returns {boolean} - 是否过期
   */
  function isTokenExpired() {
    return tokenExpireTime.value && Date.now() > tokenExpireTime.value
  }
  
  // 使用持久化的数据初始化
  if (token.value) {
    // 如果有token，检查是否过期
    if (tokenExpireTime.value && Date.now() > tokenExpireTime.value) {
      // 已过期，执行登出
      logout()
    } else {
      // 未过期，设置新的过期时间
      setTokenExpireTime()
      // 获取最新用户信息
      fetchUserInfo().catch(() => {
        logout()
      })
    }
  }
  
  return {
    token,
    userInfo,
    userPhone,
    tokenExpireTime,
    isLogin,
    userLogin,
    fetchCode,
    fetchUserInfo,
    refreshTokenExpireTime,
    logout,
    isTokenExpired,
    userRegister
  }
}, {
  persist: {
    key: 'user-store',
    storage: sessionStorage,
    paths: ['token', 'userPhone', 'userInfo', 'tokenExpireTime']
  }
})