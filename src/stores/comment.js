import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { submitComment, checkOrderComment, getShopComments } from '../api/comment'
import { useOrderStore } from './order'
import { useUserStore } from './user'

/**
 * 评论状态管理
 */
export const useCommentStore = defineStore('comment', () => {
  // 状态
  const comments = ref([])
  const shopComments = ref({}) // 按店铺ID存储评论
  const loading = ref(false)
  
  // 获取订单store
  const orderStore = useOrderStore()
  
  /**
   * 提交评价
   * @param {Object} commentData - 评价数据
   * @returns {Promise} - 评价结果
   */
  async function submitUserComment(commentData) {
    try {
      loading.value = true
      // 从用户存储中获取用户信息
      const userStore = useUserStore()
      const userInfo = userStore.userInfo

      const res = await submitComment(commentData)
      
      if (res.success) {
        // 将新评论添加到本地存储，使用真实用户昵称
        const newComment = {
          id: res.data,
          ...commentData,
          createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          userNickName: userInfo.nickName || "未知用户", // 优先使用昵称
          userIcon: userInfo.icon || "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        }
        
        // 添加到评论数组
        comments.value.push(newComment)
        
        // 更新店铺评论
        if (!shopComments.value[commentData.shopId]) {
          shopComments.value[commentData.shopId] = []
        }
        shopComments.value[commentData.shopId].unshift(newComment)
        
        // 立即刷新订单列表，确保状态更新
        await orderStore.fetchOrderList()
      }
      
      return res
    } catch (error) {
      console.error('提交评价失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 检查订单是否已评价
   * @param {number} orderId - 订单ID
   * @returns {Promise<boolean>} - 是否已评价
   */
  async function checkIfOrderCommented(orderId) {
    try {
      // 先检查本地评论
      const hasLocalComment = comments.value.some(comment => comment.orderId === orderId)
      if (hasLocalComment) {
        return true
      }
      
      // 查询服务器
      const res = await checkOrderComment(orderId)
      if(res.success){
        return true
      }
      return false
    } catch (error) {
      console.error('检查订单评价状态失败:', error)
      return false
    }
  }
  
  /**
   * 加载店铺评价列表
   * @param {number} shopId - 店铺ID
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 评价列表数据
   */
  async function fetchShopComments(shopId, params = {}) {
    try {
      loading.value = true
      const res = await getShopComments(shopId, params)
      
      if (res.success) {
        // 更新店铺评论
        if (!shopComments.value[shopId]) {
          shopComments.value[shopId] = []
        }
        
        // 直接使用服务器返回的评论，避免重复
        shopComments.value[shopId] = [...res.data.list]
        
        return {
          list: shopComments.value[shopId],
          total: res.data.total || 0
        }
      }
      
      return {
        data: [],
        total: 0
      }
    } catch (error) {
      console.error('加载店铺评价失败:', error)
      return {
        data: [],
        total: 0
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 清理所有评论数据（用于测试）
   */
  function clearAllComments() {
    comments.value = []
    shopComments.value = {}
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  
  return {
    // 状态
    comments,
    shopComments,
    loading,
    
    // 计算属性
    isLoading,
    
    // 方法
    submitUserComment,
    checkIfOrderCommented,
    fetchShopComments,
    clearAllComments,
  }
}, {
  persist: true // 使用默认配置，更简洁
})
