import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createOrder, getOrderDetail, getUserOrders, payOrder, cancelOrder, confirmOrder } from '../api/order'

/**
 * 订单状态管理
 */
export const useOrderStore = defineStore('order', () => {
  // 状态
  const currentOrder = ref({})
  const orderList = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  /**
   * 创建订单
   * @param {Object} orderData - 订单数据
   * @returns {Promise} - 创建结果
   */
  async function createNewOrder(orderData) {
    try {
      loading.value = true
      const res = await createOrder(orderData)
      if (res.success) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取订单详情
   * @param {number} id - 订单ID
   * @returns {Promise} - 订单详情
   */
  async function fetchOrderDetail(id) {
    try {
      loading.value = true
      const res = await getOrderDetail(id)
      if (res.success) {
        currentOrder.value = res.data
      }
      return res.data
    } catch (error) {
      console.error('获取订单详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取用户订单列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 订单列表
   */
  async function fetchOrderList(params = {}) {
    try {
      loading.value = true
      const res = await getUserOrders(params)
      if (res.success) {
        orderList.value = res.data
        total.value = res.total || 0
      }
      return {
        list: res.data,
        total: res.total
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 支付订单
   * @param {number} orderId - 订单ID
   * @param {number} payType - 支付方式: 1-微信支付，2-支付宝
   * @returns {Promise} - 支付结果
   */
  async function payUserOrder(orderId, payType = 1) {
    try {
      loading.value = true
      const res = await payOrder(orderId, payType)
      return res
    } catch (error) {
      console.error('支付订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @returns {Promise} - 取消结果
   */
  async function cancelUserOrder(orderId) {
    try {
      loading.value = true
      const res = await cancelOrder(orderId)
      return res
    } catch (error) {
      console.error('取消订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 确认收货
   * @param {number} orderId - 订单ID
   * @returns {Promise} - 确认结果
   */
  async function confirmUserOrder(orderId) {
    try {
      loading.value = true
      const res = await confirmOrder(orderId)
      return res
    } catch (error) {
      console.error('确认收货失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  const orderTotal = computed(() => total.value)
  
  return {
    // 状态
    currentOrder,
    orderList,
    loading,
    total,
    
    // 计算属性
    isLoading,
    orderTotal,
    
    // 方法
    createNewOrder,
    fetchOrderDetail,
    fetchOrderList,
    payUserOrder,
    cancelUserOrder,
    confirmUserOrder
  }
})
