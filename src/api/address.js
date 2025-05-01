import request from '../utils/request'

/**
 * 获取用户地址列表
 * @returns {Promise} - 返回地址列表
 */
export function getUserAddresses() {
  return request({
    url: '/address/list',
    method: 'get'
  })
}

/**
 * 添加用户地址
 * @param {Object} addressData - 地址数据
 * @returns {Promise} - 添加结果
 */
export function addUserAddress(addressData) {
  return request({
    url: '/address/add',
    method: 'post',
    data: addressData
  })
}

/**
 * 更新用户地址
 * @param {Object} addressData - 地址数据
 * @returns {Promise} - 更新结果
 */
export function updateUserAddress(addressData) {
  return request({
    url: '/address/update',
    method: 'post',
    data: addressData
  })
}

/**
 * 删除用户地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 删除结果
 */
export function deleteUserAddress(id) {
  return request({
    url: `/address/delete/${id}`,
    method: 'post'
  })
}

/**
 * 设置默认地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 设置结果
 */
export function setDefaultAddress(id) {
  return request({
    url: `/address/set-default/${id}`,
    method: 'post'
  })
}