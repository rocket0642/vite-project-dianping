import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cancelOrder, confirmOrder, createOrder, deliveryOrder, getOrderDetail, getUserOrders, getUserOrderStatistics, payOrder as payOrderApi, shipOrder, updateOrderStatus } from '../api/order'
import { useGoodsStore } from './goods'
import { useShopStore } from './shop'
import { getOrderCount } from '../api/order'
import { getTodaySales } from '../api/order'
import request from '../utils/request'
import { submitAfterSale, handleAfterSale } from '../api/afterSale'

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
  const orderCount = ref(0)
  const todaySales = ref(0)

  // 订单列表页面状态
  const orderListPageState = ref({
    activeTab: 'all',
    paginationState: {
      all: { currentPage: 1, total: 0 },
      paid: { currentPage: 1, total: 0 },
      unpaid: { currentPage: 1, total: 0 },
      canceled: { currentPage: 1, total: 0 },
      unreceived: { currentPage: 1, total: 0 },
      uncommented: { currentPage: 1, total: 0 },
      afterSale: { currentPage: 1, total: 0 }
    }
  })

  // 引入商品和商铺store
  const goodsStore = useGoodsStore()
  const shopStore = useShopStore()

  // 1. 添加新的状态常量
  const ORDER_STATUS = {
    AFTER_SALE: 6,
    AFTER_SALE_COMPLETE: 7
  }

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
        orderList.value = res.data || []
        total.value = res.total || 0

        // 更新分页状态
        if (params.status === 6) {
          orderListPageState.value.paginationState.afterSale = {
            currentPage: params.current || 1,
            total: res.total || 0
          }
        }

        return {
          success: true,
          data: orderList.value,
          total: total.value
        }
      }
      return {
        success: false,
        data: [],
        total: 0
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
   * @returns {Promise} 支付结果
   */
  async function payOrder(orderId) {
    try {
      const res = await payOrderApi(orderId)
      if (res.success) {
        // 支付成功后更新订单状态为已支付(2)
        if (currentOrder.value && currentOrder.value.id === orderId) {
          currentOrder.value.status = 2
          currentOrder.value.payTime = new Date().toISOString()
        }

        // 更新订单列表中的订单状态
        const order = orderList.value.find(o => o.id === orderId)
        if (order) {
          order.status = 2
          order.payTime = new Date().toISOString()
        }
      }
      return res
    } catch (error) {
      console.error('支付订单失败:', error)
      throw error
    }
  }

  /**
   * 取消订单
   * @param {Object} data - 取消原因等数据
   * @returns {Promise} - 取消结果
   */
  async function cancelUserOrder(data) {
    try {
      loading.value = true
      const res = await cancelOrder(data)
      return res
    } catch (error) {
      console.error('取消订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 发货
   * @param {number} orderId - 订单ID
   * @returns {Promise} - 发货结果
   */
  async function confirmUserOrder(orderId) {
    try {
      loading.value = true
      const res = await confirmOrder(orderId)
      return res
    } catch (error) {
      console.error('发货失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 确认收货
   * @param {number} orderId - 订单ID
   */
  async function deliveryUserOrder(orderId) {
    if (!orderId) {
      throw new Error('订单ID不能为空')
    }

    try {
      const res = await deliveryOrder(orderId)
      if (res.success) {
        // 更新订单状态为已完成(5)
        if (currentOrder.value && currentOrder.value.id === orderId) {
          currentOrder.value.status = 5
        }

        // 更新订单列表中的状态
        const order = orderList.value.find(o => o.id === orderId)
        if (order) {
          order.status = 5
        }
      }
      return res
    } catch (error) {
      console.error('确认收货失败:', error)
      throw error
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
      uncommented: 0,
      afterSale: 0
    }

    orderList.value.forEach(order => {
      if (order.status === 1) stats.unpaid++
      else if (order.status === 2) stats.undelivered++
      else if (order.status === 3) stats.unreceived++
      else if (order.status === 4) stats.uncommented++
      else if (order.status === 6) stats.afterSale++
    })

    return stats
  })

  /**
   * 获取用户订单统计数据
   * @returns {Promise} - 订单统计数据
   */
  async function fetchOrderStatistics() {
    try {
      loading.value = true
      const res = await getUserOrderStatistics()
      return res
    } catch (error) {
      console.error('获取订单统计数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderCount() {
    const res = await getOrderCount()
    if (res.success) {
      orderCount.value = res.data
    }
  }

  async function fetchTodaySales() {
    const res = await getTodaySales()
    if (res.success) {
      todaySales.value = res.data
    }
  }

  /**
   * 商家发货
   * @param {number} orderId - 订单ID
   * @returns {Promise} - 发货结果
   */
  async function shipUserOrder(orderId) {
    if (!orderId) {
      throw new Error('订单ID不能为空')
    }

    try {
      loading.value = true
      const res = await shipOrder(orderId)
      if (res.success) {
        // 更新当前订单状态
        if (currentOrder.value && currentOrder.value.id === orderId) {
          currentOrder.value.status = 4  // 更新为已发货状态
          currentOrder.value.deliveryTime = new Date().toISOString()
        }

        // 更新订单列表中的状态
        const order = orderList.value.find(o => o.id === orderId)
        if (order) {
          order.status = 4
          order.deliveryTime = new Date().toISOString()
        }
      }
      return res
    } catch (error) {
      console.error('商家发货失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取售后订单列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 售后订单列表
   */
  async function fetchAfterSaleOrders(params = {}) {
    try {
      loading.value = true
      // 添加售后状态过滤
      const afterSaleParams = {
        ...params,
        status: [6, 7]  // 售后处理中和售后完成的状态
      }
      const res = await getUserOrders(afterSaleParams)
      if (res.success) {
        orderList.value = res.data
        total.value = res.total || 0
      }
      return {
        list: orderList.value,
        total: total.value
      }
    } catch (error) {
      console.error('获取售后订单列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 修改提交售后申请的方法
  async function submitAfterSaleApplication(data) {
    try {
      // 处理图片数组
      const afterSaleData = {
        ...data,
        images: Array.isArray(data.images) ? data.images :
          typeof data.images === 'string' ? [data.images] : []
      }

      // 1. 提交售后申请
      const res = await submitAfterSale(afterSaleData)

      if (res.success) {
        // 2. 更新订单状态为售后中(6)
        const updateRes = await handleAfterSale({
          id: data.orderId,
          status: ORDER_STATUS.AFTER_SALE
        })

        if (updateRes.success) {
          // 3. 更新本地订单状态
          const order = orderList.value.find(o => o.id === data.orderId)
          if (order) {
            order.status = ORDER_STATUS.AFTER_SALE
            order.afterSaleTime = new Date().toISOString()
          }

          // 4. 重新获取售后列表
          await fetchOrderList({
            current: 1,
            pageSize: 5,
            status: ORDER_STATUS.AFTER_SALE
          })

          return true
        }
      }
      throw new Error(res.errorMsg || '提交售后申请失败')
    } catch (error) {
      console.error('提交售后申请失败:', error)
      throw error
    }
  }

  // 更新订单状态
  async function updateOrderStatus(data) {
    try {
      // 使用正确的售后处理API
      const res = await handleAfterSale({
        id: data.id,
        status: data.status
      })

      if (res.success) {
        // 更新本地订单状态
        const order = orderList.value.find(o => o.id === data.id)
        if (order) {
          order.status = data.status
          if (data.status === 6) {
            order.afterSaleTime = new Date().toISOString()
          }
        }

        // 如果是更新为售后状态，重新获取售后列表
        if (data.status === 6) {
          await fetchOrderList({
            current: 1,
            pageSize: 5,
            status: 6
          })
        }
      }
      return res
    } catch (error) {
      console.error('更新订单状态失败:', error)
      return {
        success: false,
        errorMsg: error.message || '更新订单状态失败'
      }
    }
  }

  return {
    // 状态
    currentOrder,
    orderList,
    loading,
    total,
    orderTimers,
    orderListPageState,
    orderCount,
    todaySales,

    // 计算属性
    isLoading,
    orderTotal,
    orderStats: getOrderStats,

    // 方法
    createNewOrder,
    fetchOrderDetail,
    fetchOrderList,
    payOrder,
    cancelUserOrder,
    confirmUserOrder,
    deliveryUserOrder,
    startOrderCountdown,
    getOrderRemainingTime,
    clearOrderCountdown,
    fetchOrderStatistics,
    fetchOrderCount,
    fetchTodaySales,
    shipUserOrder,
    fetchAfterSaleOrders,
    submitAfterSaleApplication,
    updateOrderStatus
  }
})
