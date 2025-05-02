import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createOrder, getOrderDetail, getUserOrders, payOrder, cancelOrder, confirmOrder } from '../api/order'
import { useGoodsStore } from './goods'
import { useShopStore } from './shop'

/**
 * 订单状态管理
 */
export const useOrderStore = defineStore('order', () => {
  // 状态
  const currentOrder = ref({})
  const orderList = ref([])
  const loading = ref(false)
  const total = ref(0)
  const orderTimers = ref({}) // 存储订单倒计时信息
  
  // 引入商品和商铺store
  const goodsStore = useGoodsStore()
  const shopStore = useShopStore()
  
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
      // 确保orderId是数字
      const id = parseInt(orderId);
      const res = await payOrder(id, payType)
      
      // 支付成功后刷新订单详情
      if (res.success) {
        await fetchOrderDetail(id)
      }
      
      return res
    } catch (error) {
      console.error('支付订单失败:', error)
      return {
        success: false,
        errorMsg: '支付请求失败，请稍后重试'
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @param {string} reason - 取消原因
   * @returns {Promise} - 取消结果
   */
  async function cancelUserOrder(orderId, reason = "用户取消") {
    try {
      loading.value = true
      // 先获取订单详情，确保有最新数据
      await fetchOrderDetail(orderId)
      const order = currentOrder.value
      
      const res = await cancelOrder(orderId, { reason })
      
      // 如果取消成功，恢复库存和减少销量
      if (res.success) {
        if (order.items && order.items.length) {
          // 处理有多个商品的订单
          order.items.forEach(item => {
            // 恢复库存，考虑SKU
            goodsStore.updateGoodsStock(item.goodsId, -item.count, item.skuId)
            // 减少销量，考虑SKU
            goodsStore.updateGoodsSold(item.goodsId, -item.count, item.skuId)
          })
          // 减少店铺销量
          shopStore.updateShopSales(order.shopId, -order.count)
        } else {
          // 处理单个商品的订单
          goodsStore.updateGoodsStock(order.goodsId, -order.count, order.skuId)
          goodsStore.updateGoodsSold(order.goodsId, -order.count, order.skuId)
          shopStore.updateShopSales(order.shopId, -order.count)
        }
      }
      
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

  /**
   * 开始订单倒计时 - 第一次点击支付才开始
   * @param {number} orderId - 订单ID
   */
  function startOrderCountdown(orderId) {
    // 检查是否已经存在倒计时，如果不存在才设置
    if (!orderTimers.value[orderId]) {
      // 设置30分钟倒计时，从当前时间开始
      const expireTime = Date.now() + 30 * 60 * 1000;
      orderTimers.value[orderId] = expireTime;
      
      // 持久化保存
      localStorage.setItem(`order_timer_${orderId}`, expireTime.toString());
    }
  }
  
  /**
   * 获取订单剩余时间（秒）
   * @param {number} orderId - 订单ID
   * @returns {number} - 剩余时间（秒）
   */
  function getOrderRemainingTime(orderId) {
    // 从本地存储获取倒计时信息
    const savedTime = localStorage.getItem(`order_timer_${orderId}`);
    const expireTime = savedTime ? parseInt(savedTime) : orderTimers.value[orderId];
    
    if (!expireTime) return 0;
    
    const now = Date.now();
    const remainingMs = expireTime - now;
    
    // 返回剩余秒数，如果已经过期则返回0
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
  
  /**
   * 清除订单倒计时
   * @param {number} orderId - 订单ID
   */
  function clearOrderCountdown(orderId) {
    delete orderTimers.value[orderId];
    localStorage.removeItem(`order_timer_${orderId}`);
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  const orderTotal = computed(() => total.value)
  
  // 获取订单统计
  const getOrderStats = computed(() => {
    const stats = {
      unpaid: 0,
      undelivered: 0,
      unreceived: 0,
      uncommented: 0
    }
    
    orderList.value.forEach(order => {
      if (order.status === 1) stats.unpaid++
      else if (order.status === 2) stats.undelivered++
      else if (order.status === 3) stats.unreceived++
      else if (order.status === 4) stats.uncommented++
    })
    
    return stats
  })
  
  return {
    // 状态
    currentOrder,
    orderList,
    loading,
    total,
    orderTimers,
    
    // 计算属性
    isLoading,
    orderTotal,
    orderStats: getOrderStats,
    
    // 方法
    createNewOrder,
    fetchOrderDetail,
    fetchOrderList,
    payUserOrder,
    cancelUserOrder,
    confirmUserOrder,
    startOrderCountdown,
    getOrderRemainingTime,
    clearOrderCountdown
  }
})
