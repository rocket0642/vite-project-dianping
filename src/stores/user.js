import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, loginByPassword, getCode, getUserInfo } from '../api/user'

/**
 * 用户状态管理
 * 使用Pinia管理用户登录状态、token和用户信息
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref({})
  
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
        localStorage.setItem('token', res.data.token)
        await fetchUserInfo()
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
        localStorage.setItem('token', res.data.token)
        await fetchUserInfo()
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
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
  }
  
  // 初始化时从localStorage加载token
  const savedToken = localStorage.getItem('token')
  if (savedToken) {
    token.value = savedToken
    fetchUserInfo().catch(() => {
      // 如果获取用户信息失败，清除token
      logout()
    })
  }
  
  return {
    token,
    userInfo,
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
    paths: ['token']
  }
})