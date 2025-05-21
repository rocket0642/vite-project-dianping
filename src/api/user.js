import request from '../utils/request'

/**
 * 验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} password - 密码
 * @returns {Promise} - 登录结果
 */
export function login(phone, code, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { phone, code, password }
  })
}

/**
 * 刷新accessToken
 * @returns {Promise} - 刷新结果
 */
export function refreshToken() {
  return request({
    url: '/user/refresh-token',
    method: 'get'
  })
}

/**
 * 退出登录
 * @returns {Promise} - 退出登录结果
 */
export function userLogout() {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}
/**
 * 获取验证码
 * @param {string} phone - 手机号
 * @returns {Promise} - 获取验证码结果
 */
export function getCode(phone, type) {
  return request({
    url: '/user/code',
    method: 'post',
    data: { phone, type }
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @param {string} data.password - 密码
 * @returns {Promise} - 注册结果
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise} - 用户信息
 */
export function getUserInfo() {
  return request({
    url: `/user/info`,
    method: 'get'
  })
}


/**
 * 更新用户基本信息
 * @param {Object} data - 用户信息
 * @returns {Promise} - 更新结果
 */
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}


/**
 * 更新用户详细信息
 * @param {Object} data - 用户详细信息
 * @returns {Promise} - 更新结果
 */
export function updateUserDetail(data) {
  return request({
    url: '/user/info',
    method: 'put',
    data
  })
}

/**
 * 重置密码
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} password - 新密码
 * @returns {Promise} - 重置结果
 */
export function resetPassword(phone, code, password) {
  return request({
    url: '/user/reset-password',
    method: 'put',
    data: { phone, code, password }
  })
}

/**
 * 上传图片
 * @param {FormData} formData - 包含文件和其他参数的FormData对象
 * @returns {Promise} - 上传结果
 */
export function uploadImage(formData) {
  return request({
    url: '/upload/save',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除图片
 * @param {string} url - 图片URL
 * @returns {Promise} - 删除结果
 */
export function uploadDelete(url) {
  return request({
    url: '/upload/delete',
    method: 'delete',
    params: { filename: url }
  })
}

/**
 * 获取用户总数
 * @returns {Promise} - 用户总数
 */
export function getUserCount() {
  return request({
    url: '/user/count',
    method: 'get'
  })
}

