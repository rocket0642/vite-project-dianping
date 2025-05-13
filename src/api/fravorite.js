import request from '../utils/request'

// 收藏店铺
export const collectShop = (shop) => {
    return request({
        url: '/favorite/add',
        method: 'POST',
        data: shop
    })
}

// 取消收藏店铺
export const cancelCollectShop = (shopId) => {
    return request({
        url: '/favorite/delete',
        method: 'DELETE',
        params: { shopId }
    })
}

// 获取收藏店铺列表
export const getCollectShopList = () => {
    return request({
        url: '/favorite/list',
        method: 'GET',
    })
}

