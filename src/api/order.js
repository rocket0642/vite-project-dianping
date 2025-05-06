import request from '../utils/request'

/**
 * 创建订单
 * @param {Object} data - 订单信息
 * @returns {Promise} - 创建结果
 */
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise} - 订单详情
 */
export function getOrderDetail(id) {
  return request({
    url: `/order/status/${id}`,
    method: 'get'
  })
}

/**
 * 获取用户订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.status] - 订单状态: 0-全部，1-未支付，2-已支付，3-已取消，4-已完成
 * @param {number} [params.current] - 当前页码
 * @returns {Promise} - 订单列表
 */
export function getUserOrders(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

/**
 * 获取用户订单统计数据
 * @returns {Promise} - 订单统计数据
 */
export function getUserOrderStatistics() {
  return request({
    url: '/order/statistics',
    method: 'get'
  })
}

/**
 * 支付订单
 * @param {number} orderId - 订单ID
 * @param {number} payType - 支付方式: 1-微信支付，2-支付宝
 * @returns {Promise} - 支付结果
 */
export function payOrder(orderId, payType = 1) {
  return request({
    url: `/order/pay/${orderId}`,
    method: 'put',
    params: { payType }
  })
}

/**
 * 取消订单
 * @param {Object} data - 取消原因等数据
 * @returns {Promise} - 取消结果
 */
export function cancelOrder(data) {
  return request({
    url: `/order/cancel`,
    method: 'put',
    data
  })
}

/**
 * 发货
 * @param {number} orderId - 订单ID
 * @returns {Promise} - 发货结果
 */
export function confirmOrder(orderId) {
  return request({
    url: `/order/confirm/${orderId}`,
    method: 'put'
  })
}

/**
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise} - 确认收货结果
 */
export function deliveryOrder(orderId) {
  return request({
    url: `/order/delivery/${orderId}`,
    method: 'put'
  })
}
