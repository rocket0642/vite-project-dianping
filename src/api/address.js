import request from '../utils/request'

/**
 * 获取用户地址列表
 * @returns {Promise} - 地址列表
 */
export function getUserAddresses() {
  return request({
    url: '/user/address/list',
    method: 'get'
  })
}

/**
 * 添加用户地址
 * @param {Object} data - 地址信息
 * @param {string} data.name - 收货人姓名
 * @param {string} data.phone - 收货人电话
 * @param {string} data.address - 详细地址
 * @param {boolean} data.isDefault - 是否默认地址
 * @returns {Promise} - 添加结果
 */
export function addUserAddress(data) {
  return request({
    url: '/user/address/add',
    method: 'post',
    data
  })
}

/**
 * 更新用户地址
 * @param {Object} data - 地址信息
 * @param {number} data.id - 地址ID
 * @param {string} data.name - 收货人姓名
 * @param {string} data.phone - 收货人电话
 * @param {string} data.address - 详细地址
 * @param {boolean} data.isDefault - 是否默认地址
 * @returns {Promise} - 更新结果
 */
export function updateUserAddress(data) {
  return request({
    url: '/user/address/update',
    method: 'put',
    data
  })
}

/**
 * 删除用户地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 删除结果
 */
export function deleteUserAddress(id) {
  return request({
    url: `/user/address/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 设置默认地址
 * @param {number} id - 地址ID
 * @returns {Promise} - 设置结果
 */
export function setDefaultAddress(id) {
  return request({
    url: `/user/address/default/${id}`,
    method: 'put'
  })
}