import request from '../utils/request'

/**
 * 获取用户购物车
 * @returns {Promise} Promise对象
 */
export function getUserCart() {
    return request({
        url: '/cart',
        method: 'get'
    })
}

/**
 * 添加商品到购物车
 * @param {Object} cartItem - 购物车项
 * @returns {Promise} Promise对象
 */
export function addToCart(cartItem) {
    return request({
        url: '/cart/add',
        method: 'post',
        data: cartItem
    })
}

/**
 * 合并购物车
 * @param {Object} guestCart - 游客购物车数据
 * @returns {Promise} Promise对象
 */
export function mergeCart(guestCart) {
    return request({
        url: '/cart/merge',
        method: 'post',
        data: guestCart
    })
}

/**
 * 更新购物车商品数量
 * @param {Object} params - 请求参数
 * @param {number} params.shopId - 商铺ID
 * @param {number} params.goodsId - 商品ID
 * @param {number} [params.skuId] - 商品SKU ID
 * @param {number} params.count - 商品数量
 * @returns {Promise} Promise对象
 */
export function updateCartItemCount(params) {
    return request({
        url: '/cart/count',
        method: 'put',
        params
    })
}

/**
 * 移除购物车商品
 * @param {Object} params - 请求参数
 * @param {number} params.shopId - 商铺ID
 * @param {number} params.goodsId - 商品ID
 * @param {number} [params.skuId] - 商品SKU ID
 * @returns {Promise} Promise对象
 */
export function removeFromCart(params) {
    return request({
        url: '/cart/remove',
        method: 'delete',
        params
    })
}

/**
 * 清空购物车
 * @returns {Promise} Promise对象
 */
export function clearCart() {
    return request({
        url: '/cart/clear',
        method: 'delete'
    })
}

/**
 * 选中或取消选中购物车商品
 * @param {Object} params - 请求参数
 * @param {number} params.shopId - 商铺ID
 * @param {number} params.goodsId - 商品ID
 * @param {number} [params.skuId] - 商品SKU ID
 * @param {boolean} params.checked - 是否选中
 * @returns {Promise} Promise对象
 */
export function checkCartItem(params) {
    return request({
        url: '/cart/check',
        method: 'put',
        params
    })
}

/**
 * 全选或取消全选
 * @param {boolean} checked - 是否全选
 * @returns {Promise} Promise对象
 */
export function checkAllItems(checked) {
    return request({
        url: '/cart/check/all',
        method: 'put',
        params: { checked }
    })
}

/**
 * 选中或取消选中商铺商品
 * @param {Object} params - 请求参数
 * @param {number} params.shopId - 商铺ID
 * @param {boolean} params.checked - 是否选中
 * @returns {Promise} Promise对象
 */
export function checkShopItems(params) {
    return request({
        url: '/cart/check/shop',
        method: 'put',
        params
    })
}

/**
 * 移除选中商品
 * @returns {Promise} Promise对象
 */
export function removeCheckedItems() {
    return request({
        url: '/cart/remove/checked',
        method: 'delete'
    })
} 