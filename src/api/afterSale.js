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
 * 获取售后列表（管理员）
 * 与getAllAfterSales保持一致，为了兼容现有代码
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求结果
 */
export function getAfterSaleList(params) {
    return request({
        url: '/after-sale/admin/list',
        method: 'get',
        params
    })
}

/**
 * 管理员处理售后
 * @param {Object} data - 处理数据
 * @returns {Promise} - 请求结果
 */
export function handleAfterSale(data) {
    return request({
        url: '/after-sale/admin/handle',
        method: 'put',
        data
    })
}
