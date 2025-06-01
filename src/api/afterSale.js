import request from '../utils/request'

/**
 * 申请售后
 * @param {Object} data - 售后申请数据
 * @returns {Promise} - 请求结果
 */
export function applyAfterSale(data) {
    return request({
        url: '/after-sale/apply',
        method: 'post',
        data
    })
}

/**
 * 获取售后详情
 * @param {number} id - 售后ID
 * @returns {Promise} - 请求结果
 */
export function getAfterSaleDetail(id) {
    return request({
        url: `/after-sale/detail/${id}`,
        method: 'get'
    })
}

/**
 * 根据订单ID获取售后列表
 * @param {string} orderId - 订单ID
 * @returns {Promise} - 请求结果
 */
export function getAfterSaleByOrderId(orderId) {
    return request({
        url: `/after-sale/order/${orderId}`,
        method: 'get'
    })
}

/**
 * 获取用户的售后记录列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求结果
 */
export function getUserAfterSales(params) {
    return request({
        url: '/after-sale/user/list',
        method: 'get',
        params
    })
}

/**
 * 获取所有售后记录（管理员）
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求结果
 */
export function getAllAfterSales(params) {
    return request({
        url: '/after-sale/admin/list',
        method: 'get',
        params
    })
}
