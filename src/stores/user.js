import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCode, getUserInfo, login, register, resetPassword, uploadDelete, uploadImage, userLogout } from '../api/user'
import { useCartStore } from './cart'

/**
 * 用户状态管理
 * 使用Pinia管理用户登录状态、token和用户信息
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(null)
  const userInfo = ref(null)
  const userPhone = ref(null)
  const tokenExpireTime = ref(null) // Token过期时间
  const tokenTimer = ref(null) // 定时器引用
  const rememberMe = ref(false) // 添加记住我状态
  const isAdmin = ref(false) // 添加管理员状态
  // token时效
  const TOKEN_EXPIRE_TIME = 30 * 60 * 1000 // 30分钟
  // 计算属性
  const isLogin = computed(() => !!token.value)

  /**
   * 设置Token过期时间（30分钟）
   */
  function setTokenExpireTime() {
    // 设置30分钟后过期
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
   * @param {boolean} remember - 是否记住登录状态
   * @returns {Promise} - 登录结果
   */
  async function userLogin(phone, code, password, remember = false) {
    try {
      const res = await login(phone, code, password)
      if (res.success) {
        token.value = res.data.token
        isAdmin.value = res.data.isAdmin
        userPhone.value = phone
        rememberMe.value = remember // 保存记住我状态
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
  async function fetchCode(phone, type) {
    try {
      const res = await getCode(phone, type)
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取用户信息
   * @returns {Promise} - 用户信息
   */
  async function fetchUserInfo() {
    try {
      if (userInfo.value) {
        return userInfo.value
      }
      const res = await getUserInfo()
      if (res.success) {
        userInfo.value = res.data
      }
      return userInfo.value
    } catch (error) {
      throw error
    }
  }

  /**
   * 清除用户数据但不跳转
   */
  function clearUserData() {
    // 清除token和相关数据
    token.value = null
    userInfo.value = null
    userPhone.value = null
    tokenExpireTime.value = null
    rememberMe.value = false

    // 清除定时器
    if (tokenTimer.value) {
      clearTimeout(tokenTimer.value)
      tokenTimer.value = null
    }

    // 切换到游客购物车
    const cartStore = useCartStore()
    if (cartStore) {
      cartStore.switchUserCart(null)
    }
  }

  /**
   * 退出登录
   */
  async function logout() {
    try {
      const res = await userLogout(userPhone.value)
      clearUserData()
      return res
    } catch (error) {
      clearUserData()
      throw error
    }
  }

  /**
   * 上传用户图片
   * @param {FormData} formData - 包含文件和其他参数的FormData对象
   * @returns {Promise} - 上传结果
   */
  async function uploadUserSave(formData) {
    try {
      const res = await uploadImage(formData)
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 删除图片
   * @param {string} url - 图片URL
   * @returns {Promise} - 删除结果
   */
  async function uploadUserDelete(url) {
    try {
      const res = await uploadDelete(url)
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 检查Token是否过期
   * @returns {boolean} - 是否过期
   */
  function isTokenExpired() {
    return tokenExpireTime.value && Date.now() > tokenExpireTime.value
  }

  /**
   * 重置密码
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @param {string} password - 新密码
   * @returns {Promise} - 重置结果
   */
  async function resetUserPassword(phone, code, password) {
    try {
      const res = await resetPassword(phone, code, password)
      return res
    } catch (error) {
      throw error
    }
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
    isAdmin,
    userLogin,
    fetchCode,
    fetchUserInfo,
    refreshTokenExpireTime,
    logout,
    isTokenExpired,
    userRegister,
    resetUserPassword,
    uploadUserSave,
    uploadUserDelete,
    clearUserData,
    rememberMe
  }
}, {
  persist: {
    key: 'user-store-data',
    // 根据rememberMe决定使用哪种存储方式
    storage: {
      getItem: (key) => {
        // 先从localStorage获取rememberMe状态
        const storeData = localStorage.getItem(key)
        if (storeData) {
          const data = JSON.parse(storeData)
          // 如果localStorage有数据并且rememberMe为true，使用localStorage
          if (data?.rememberMe) {
            return storeData
          }
        }
        // 否则尝试从sessionStorage获取
        return sessionStorage.getItem(key)
      },
      setItem: (key, value) => {
        const data = JSON.parse(value)
        // 根据rememberMe决定存储位置
        if (data?.rememberMe) {
          localStorage.setItem(key, value)
        } else {
          // 未勾选记住我，从localStorage中移除
          localStorage.removeItem(key)
          // 存入sessionStorage
          sessionStorage.setItem(key, value)
        }
      },
      removeItem: (key) => {
        // 同时清除两处存储
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      }
    },
    paths: ['token', 'userPhone', 'userInfo', 'tokenExpireTime', 'rememberMe']
  }
})