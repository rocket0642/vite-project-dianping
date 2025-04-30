import request from '../utils/request'

/**
 * 验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise} - 登录结果
 */
export function login(phone, code) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { phone, code }
  })
}

/**
 * 密码登录
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {Promise} - 登录结果
 */
export function loginByPassword(phone, password) {
  return request({
    url: '/user/login/password',
    method: 'post',
    data: { phone, password }
  })
}

/**
 * 获取验证码
 * @param {string} phone - 手机号
 * @returns {Promise} - 获取验证码结果
 */
export function getCode(phone) {
  return request({
    url: '/user/code',
    method: 'post',
    data: { phone }
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
    url: '/user/me',
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