import request from '../utils/request'

/**
 * 获取商铺详情
 * @param {number} id - 商铺ID
 * @returns {Promise} - 商铺详情
 */
export function getShopDetail(id) {
  return request({
    url: `/shop/detail/${id}`,
    method: 'get'
  })
}

/**
 * 获取推荐商铺列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 商铺名称
 * @param {number} [params.typeId] - 商铺类型ID
 * @param {string} [params.area] - 地区
 * @param {number} [params.current] - 当前页码
 * @returns {Promise} - 商铺列表和总数
 */
export function getShopList(params) {
  return request({
    url: '/shop/recommend',
    method: 'get',
    params
  })
}

/**
 * 获取商铺类型列表
 * @returns {Promise} - 商铺类型列表
 */
export function getShopTypes() {
  return request({
    url: '/shop/types',
    method: 'get'
  })
}

/**
 * 根据类型获取商铺列表
 * @param {number} typeId - 商铺类型ID
 * @param {Object} params - 其他查询参数
 * @returns {Promise} - 商铺列表和总数
 */
export function getShopsByType(typeId, params = {}) {
  return request({
    url: '/shop/of/type',
    method: 'get',
    params: { ...params, typeId }
  })
}

/**
 * 搜索商铺
 * @param {string} keyword - 搜索关键词
 * @param {Object} params - 其他查询参数
 * @returns {Promise} - 商铺列表和总数
 */
export function searchShops(keyword, params = {}) {
  return request({
    url: '/shop/search',
    method: 'get',
    params: { ...params, name: keyword }
  })
}

/**
 * 更新商铺销量
 * @param {number} shopId - 商铺ID
 * @param {number} count - 变化数量，正数增加销量，负数减少销量
 * @returns {Promise} - 更新结果
 */
export function updateShopSalesApi(shopId, count) {
  return request({
    url: '/shop/sold',
    method: 'put',
    data: { id: shopId, count }
  })
}

/**
 * 获取商铺类型统计
 * @returns {Promise} - 商铺类型统计
 */
export function getShopTypeStats() {
  return request({
    url: '/shop/type-stats',
    method: 'get'
  })
}

/**
 * 获取商铺列表
 * @returns {Promise} - 商铺列表
 */
export function getAllShopNames() {
  return request({
    url: '/shop/list',
    method: 'get'
  })
}