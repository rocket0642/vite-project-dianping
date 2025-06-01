import request from '@/utils/request'

/**
 * 提交售后申请
 * @param {Object} data - 售后申请数据
 * @returns {Promise} - 提交结果
 */
export function submitAfterSale(data) {
    return request({
        url: '/after-sale/submit',
        method: 'post',
        data
    })
}

/**
 * 获取售后列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 售后列表
 */
export function getAfterSaleList(params) {
    return request({
        url: '/after-sale/page',
        method: 'get',
        params
    })
}

/**
 * 获取售后详情
 * @param {number} id - 售后ID
 * @returns {Promise} - 售后详情
 */
export function getAfterSaleDetail(id) {
    return request({
        url: `/after-sale/detail/${id}`,
        method: 'get'
    })
}

/**
 * 处理售后申请(同意/拒绝)
 * @param {Object} data - 处理数据
 * @returns {Promise} - 处理结果
 */
export function handleAfterSale(data) {
    return request({
        url: '/after-sale/handle',
        method: 'put',
        data
    })
}

/**
 * 更新售后状态
 * @param {Object} data - 更新数据
 * @returns {Promise} - 更新结果
 */
export function updateAfterSaleStatus(data) {
    return request({
        url: '/after-sale/status',
        method: 'put',
        data
    })
}

// 添加图片上传接口
export function uploadImage(data) {
    return request({
        url: '/after-sale/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

/**
 * 创建售后申请
 * @param {Object} data - 售后申请数据
 * @returns {Promise} - 创建结果
 */
export function createAfterSale(data) {
    return request({
        url: '/after-sale',
        method: 'post',
        data
    })
}

// 取消售后申请
export function cancelAfterSale(id) {
    return request({
        url: `/after-sale/${id}/cancel`,
        method: 'post'
    })
}

// 获取售后列表（管理员）
export function getAdminAfterSaleList(params) {
    return request({
        url: '/admin/after-sale/list',
        method: 'get',
        params
    })
}

// 处理售后申请
export function handleAdminAfterSale(data) {
    return request({
        url: '/admin/after-sale/handle',
        method: 'post',
        data
    })
}

// 获取售后详情（管理员）
export function getAdminAfterSaleDetail(id) {
    return request({
        url: `/admin/after-sale/${id}`,
        method: 'get'
    })
} 
