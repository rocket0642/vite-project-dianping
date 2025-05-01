import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, loginByPassword, getCode, getUserInfo } from '../api/user'
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
  
  // 计算属性
  const isLogin = computed(() => !!token.value)
  
  /**
   * 验证码登录
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise} - 登录结果
   */
  async function userLogin(phone, code) {
    try {
      const res = await login(phone, code)
      if (res.success) {
        token.value = res.data.token
        userPhone.value = phone
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
   * 密码登录
   * @param {string} phone - 手机号
   * @param {string} password - 密码
   * @returns {Promise} - 登录结果
   */
  async function userLoginByPassword(phone, password) {
    try {
      const res = await loginByPassword(phone, password)
      if (res.success) {
        token.value = res.data.token
        userPhone.value = phone
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
      const res = await getUserInfo()
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
    // 清除user-store
    localStorage.removeItem('user-store')

    // 退出登录后重新加载购物车数据（切换到游客购物车）
    const cartStore = useCartStore()
    if (cartStore) {
      cartStore.switchUserCart(null)
    }
  }
  
  // 使用持久化的数据初始化
  // 这个部分可以去掉，因为pinia-plugin-persistedstate会自动恢复状态
  // 但可以保留fetchUserInfo以确保有最新数据
  if (token.value) {
    fetchUserInfo().catch(() => {
      logout()
    })
  }
  
  return {
    token,
    userInfo,
    userPhone,
    isLogin,
    userLogin,
    userLoginByPassword,
    fetchCode,
    fetchUserInfo,
    logout
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userPhone', 'userInfo']
  }
})