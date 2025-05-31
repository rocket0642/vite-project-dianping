import request from '../utils/request'

/**
 * 创建支付订单
 * @param {number} orderId - 订单ID
 * @param {number} payType - 支付方式: 1-微信支付，2-支付宝
 * @returns {Promise} - 支付链接或表单
 */
export function createPayment(orderId, payType = 2) {
    console.log(`创建支付订单: orderId=${orderId}, payType=${payType}`)
    return request({
        url: '/pay/create',
        method: 'post',
        data: { orderId, payType }
    })
}

/**
 * 查询支付状态
 * @param {number} orderId - 订单ID
 * @param {number} payType - 支付方式: 1-微信支付，2-支付宝
 * @returns {Promise} - 支付结果
 */
export function queryPayStatus(orderId, payType = 2) {
    console.log(`查询支付状态: orderId=${orderId}, payType=${payType}`)
    return request({
        url: `/pay/status/${orderId}`,
        method: 'get',
        params: { payType }
    })
} 