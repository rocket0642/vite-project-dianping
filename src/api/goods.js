import request from '../utils/request'

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise} - 商品详情
 */
export function getGoodsDetail(id) {
  return request({
    url: `/goods/detail/${id}`,
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
 * @returns {Promise<Object>} - 搜索结果
 */
export function searchGoods(keyword, params) {
  return request({
    url: '/goods/search',
    method: 'get',
    params: {
      name: keyword,
      ...params
    }
  })
}

/**
 * 获取推荐商品列表
 * @param {number} count - 需要获取的商品数量
 * @returns {Promise<Object>} - 推荐商品列表
 */
export function getRecommendGoods(count) {
  return request({
    url: '/goods/recommend',
    method: 'get',
    params: { count }
  })
}

/**
 * 更新商品库存
 * @param {number} goodsId - 商品ID
 * @param {number} count - 变化数量，正数减少库存，负数增加库存
 * @param {number} [skuId] - SKU ID，如果有则更新具体SKU的库存
 * @returns {Promise} - 更新结果
 */
export function updateGoodsStockApi(goodsId, count, skuId) {
  return request({
    url: '/goods/stock',
    method: 'put',
    data: { goodsId, count, skuId }
  })
}

/**
 * 更新商品销量
 * @param {number} goodsId - 商品ID
 * @param {number} count - 变化数量，正数增加销量，负数减少销量
 * @param {number} [skuId] - SKU ID，如果有则更新具体SKU的销量
 * @returns {Promise} - 更新结果
 */
export function updateGoodsSoldApi(goodsId, count, skuId) {
  return request({
    url: '/goods/sold',
    method: 'put',
    data: { goodsId, count, skuId }
  })
}

/**
 * 获取商品总数
 * @returns {Promise} - 商品总数
 */
export function getGoodsCount() {
  return request({
    url: '/goods/count',
    method: 'get'
  })
}

export function getGoodsList(params) {
  return request({
    url: '/goods/admin/list',
    method: 'get',
    params
  })
}

/**
 * 更新商品状态
 * @param {number} id - 商品ID
 * @param {number} status - 目标状态，1表示上架，0表示下架
 * @returns {Promise} - 更新结果
 */
export function updateGoodsStatus(id, status) {
  return request({
    url: '/goods/status',
    method: 'put',
    data: { id, status }
  })
}

export function deleteGoods(id) {
  return request({
    url: `/goods/${id}`,
    method: 'delete'
  })
}
