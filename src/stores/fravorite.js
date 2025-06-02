import { defineStore } from "pinia";
import { ref, watch } from "vue"
import { getCollectShopList, collectShop, cancelCollectShop } from '../api/fravorite'
import { useUserStore } from './user'

export const useFravoriteStore = defineStore('fravorite', () => {
    // 收藏列表数据
    const favoriteList = ref([])
    const userStore = useUserStore()

    watch(() => userStore.isLogin, async (newVal, oldVal) => {
        if (newVal && !oldVal) {
            await getFavoriteList()
        }
    })

    // 从后端获取收藏列表并缓存到本地
    const getFavoriteList = async () => {
        try {
            const res = await getCollectShopList()
            if (res.success) {
                favoriteList.value = res.data.map(item => ({
                    id: item.shopId,
                    images: item.shopImages,
                    name: item.shopName,
                    ...item
                }))
            }
            return favoriteList.value
        } catch (error) {
            console.error('获取收藏列表失败:', error)
            return []
        }
    }

    // 添加收藏
    const addFavorite = async (shop) => {
        let previousState = [...favoriteList.value]
        try {
            // 添加到本地存储(已按前端命名)
            favoriteList.value.push({
                id: shop.id,
                images: shop.images,
                name: shop.name,
                address: shop.address,
                area: shop.area,
                avgPrice: shop.avgPrice,
                score: shop.score,
                sold: shop.sold,
                typeId: shop.typeId,
                typeName: shop.typeName
            })

            // 异步更新后端
            await collectShop(shop)
            return true
        } catch (error) {
            favoriteList.value = previousState
            console.error('添加收藏操作失败:', error)
            return false
        }
    }

    // 移除收藏 (使用id参数，内部转换为shopId)
    const removeFavorite = async (id) => {
        let previousState = [...favoriteList.value]
        try {
            // 先更新本地状态
            favoriteList.value = favoriteList.value.filter(i => i.id !== id)

            // 异步更新后端
            await cancelCollectShop(id)
            return true
        } catch (error) {
            favoriteList.value = previousState
            console.error('移除收藏操作失败:', error)
            return false
        }
    }

    // 检查店铺是否已收藏 (使用id参数)
    const isShopFavorited = (id) => {
        return favoriteList.value.some(shop => shop.id === id)
    }

    // 清除收藏数据
    const clearFavoriteData = () => {
        favoriteList.value = []
    }

    return {
        favoriteList,
        getFavoriteList,
        addFavorite,
        removeFavorite,
        isShopFavorited,
        clearFavoriteData  // 导出清除方法
    }
}, {
    persist: {
        key: 'favorite-data',
        storage: localStorage,
        paths: ['favoriteList']
    }
})