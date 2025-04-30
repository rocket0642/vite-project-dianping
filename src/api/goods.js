import request from '../utils/request'

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise} - 商品详情
 */
export function getGoodsDetail(id) {
  return request({
    url: `/goods/${id}`,
    method: 'get'
  })
}

/**
 * 获取商铺的商品列表
 * @param {number} shopId - 商铺ID
 * @returns {Promise} - 商品列表
 */
export function getShopGoods(shopId) {
  return request({
    url: '/goods/list',
    method: 'get',
    params: { shopId }
  })
}

/**
 * 添加商品
 * @param {Object} data - 商品信息
 * @returns {Promise} - 添加结果
 */
export function addGoods(data) {
  return request({
    url: '/goods',
    method: 'post',
    data
  })
}

/**
 * 更新商品
 * @param {Object} data - 商品信息
 * @returns {Promise} - 更新结果
 */
export function updateGoods(data) {
  return request({
    url: '/goods',
    method: 'put',
    data
  })
}

/**
 * 搜索商品
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 其他查询参数
 * @returns {Promise} - 商品搜索结果
 */
export function searchGoods(keyword, params = {}) {
  return request({
    url: '/goods/search',
    method: 'get',
    params: { keyword, ...params }
  })
}
