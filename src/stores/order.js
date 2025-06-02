import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cancelOrder, confirmOrder, createOrder, deliveryOrder, getOrderCount, getOrderDetail, getTodaySales, getUserOrders, getUserOrderStatistics } from '../api/order'
import { createPayment, queryPayStatus } from '../api/pay'

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
   * @param {String} orderId - 订单ID
   * @returns {Promise} - 订单详情
   */
  async function fetchOrderDetail(orderId) {
    try {
      loading.value = true
      const res = await getOrderDetail(orderId)
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

        return {
          success: true,
          data: orderList.value,
          total: total.value
        }
      } else {
        console.warn('获取订单列表失败:', res.errorMsg)
        ElMessage.error(res.errorMsg || '获取订单列表失败')
        orderList.value = []
        total.value = 0
      }
      return {
        success: false,
        data: [],
        total: 0
      }
    } catch (error) {
      console.error('获取订单列表出错:', error)
      ElMessage.error('获取订单列表失败，请稍后重试')
      orderList.value = []
      total.value = 0

      return {
        list: [],
        total: 0
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 支付订单
   * @param {String} orderId - 订单ID
   * @param {number} payType - 支付方式: 1-微信支付，2-支付宝
   * @returns {Promise} - 支付结果
   */
  async function payUserOrder(orderId, payType = 2) {
    try {
      loading.value = true

      // 调用支付创建API
      const res = await createPayment(orderId, payType)

      if (res.success) {
        if (payType === 2) {
          // 支付宝返回HTML表单，需要在新窗口中展示
          handleAlipayResponse(res.data)
        } else {
          // 微信支付跳转到支付链接
          window.open(res.data, '_blank')
        }
        return res
      } else {
        return res
      }
    } catch (error) {
      console.error('支付订单失败:', error)
      throw error
    }
  }

  // 处理支付宝响应
  function handleAlipayResponse(htmlContent) {
    // 创建支付表单容器
    const payContainer = document.createElement('div');
    payContainer.id = 'alipay-form-container';
    payContainer.style.position = 'fixed';
    payContainer.style.top = '0';
    payContainer.style.left = '0';
    payContainer.style.width = '100%';
    payContainer.style.height = '100%';
    payContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    payContainer.style.zIndex = '9999';
    payContainer.style.display = 'flex';
    payContainer.style.justifyContent = 'center';
    payContainer.style.alignItems = 'center';
    document.body.appendChild(payContainer);

    // 创建iframe容器
    const iframeWrapper = document.createElement('div');
    iframeWrapper.style.width = '90%';
    iframeWrapper.style.height = '90%';
    iframeWrapper.style.backgroundColor = 'white';
    iframeWrapper.style.borderRadius = '8px';
    iframeWrapper.style.overflow = 'hidden';
    iframeWrapper.style.position = 'relative';
    payContainer.appendChild(iframeWrapper);

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '10';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#f56c6c';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(payContainer);
    };
    iframeWrapper.appendChild(closeButton);

    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframeWrapper.appendChild(iframe);

    // 写入HTML内容并提交表单
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // 自动提交表单
    const form = iframeDoc.querySelector('form');
    if (form) {
      form.removeAttribute('target');
      form.submit();
    }
  }

  // 查询支付状态
  async function checkPaymentStatus(orderId, payType) {
    try {
      // 查询支付状态
      const res = await queryPayStatus(orderId, parseInt(payType))

      if (res.success && res.data === true) {
        // 支付成功，刷新订单详情
        await fetchOrderDetail(orderId)
        return true
      }

      return false
    } catch (error) {
      console.error('查询支付状态失败:', error)
      return false
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
   * @param {String} orderId - 订单ID
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
   * @param {String} orderId - 订单ID
   * @returns {Promise} - 确认收货结果  
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
   * @param {String} orderId - 订单ID
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
   * @param {String} orderId - 订单ID
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
   * @param {String} orderId - 订单ID
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
    payUserOrder,
    cancelUserOrder,
    confirmUserOrder,
    deliveryUserOrder,
    startOrderCountdown,
    getOrderRemainingTime,
    clearOrderCountdown,
    fetchOrderStatistics,
    fetchOrderCount,
    fetchTodaySales,
    checkPaymentStatus,
    handleAlipayResponse

  }
})
