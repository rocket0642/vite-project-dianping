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
 * @param {String} id - 订单ID
 * @returns {Promise} - 订单详情
 */
export function getOrderDetail(id) {
  return request({
    url: `/order/detail/${id}`,
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
 * @param {String} orderId - 订单ID
 * @returns {Promise} - 发货结果
 */
export function confirmOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'put'
  })
}

/**
 * 确认收货
 * @param {String} orderId - 订单ID
 * @returns {Promise} - 确认收货结果
 */
export function deliveryOrder(orderId) {
  return request({
    url: `/order/delivery/${orderId}`,
    method: 'put'
  })
}

/**
 * 获取订单总数
 * @returns {Promise} - 订单总数
 */
export function getOrderCount() {
  return request({
    url: '/order/count',
    method: 'get'
  })
}

/**
 * 获取今日销售额
 * @returns {Promise} - 今日销售额
 */
export function getTodaySales() {
  return request({
    url: '/order/today-sales',
    method: 'get'
  })
}

/**
 * 获取最近7天销售趋势
 * @returns {Promise} - 最近7天销售趋势
 */
export function getWeekSales() {
  return request({
    url: '/order/week-sales',
    method: 'get'
  })
}

/**
 * 分页获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.size - 每页条数
 * @param {string} [params.keyword] - 搜索关键字(订单号/用户名/手机号)
 * @param {number} [params.status] - 订单状态
 * @returns {Promise}
 */
export function getOrderPage(params) {
  return request({
    url: '/order/page',
    method: 'get',
    params
  })
}

