import request from '../utils/request'

/**
 * 提交商品评价
 * @param {Object} data - 评价数据
 * @returns {Promise} - 评价结果
 */
export function submitComment(data) {
  return request({
    url: '/comment/submit',
    method: 'post',
    data
  })
}

/**
 * 获取店铺评价列表
 * @param {number} shopId - 店铺ID
 * @param {Object} params - 查询参数
 * @returns {Promise} - 评价列表
 */
export function getShopComments(shopId, params = {}) {
  return request({
    url: '/comment/shop',
    method: 'get',
    params: { shopId, ...params }
  })
}

/**
 * 获取订单是否已评价
 * @param {number} orderId - 订单ID
 * @returns {Promise} - 是否已评价
 */
export function checkOrderComment(orderId) {
  return request({
    url: `/comment/check/${orderId}`,
    method: 'get'
  })
}
