import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getGoodsDetail, getRecommendGoods, getShopGoods, searchGoods, updateGoodsSoldApi, updateGoodsStockApi } from '../api/goods'

/**
 * 商品状态管理
 */
export const useGoodsStore = defineStore('goods', () => {
  // 状态
  const goodsDetail = ref({})
  const shopGoods = ref([])
  const recommendGoods = ref([]) // 添加随机商品列表状态
  const loading = ref(false)
  const searchResults = ref([])
  const total = ref(0)


  /**
   * 预更新商品库存
   * @param {number} goodsId - 商品ID
   * @param {number} count - 变化数量，正数减少库存，负数增加库存
   * @param {number} skuId - SKU ID，如果有则更新具体SKU的库存
   */
  async function updateGoodsStock(goodsId, count, skuId) {

    try {
      // 先确保获取商品详情
      if (!goodsDetail.value || goodsDetail.value.id !== goodsId) {
        await fetchGoodsDetail(goodsId)
      }
      const res = await updateGoodsStockApi(goodsId, count, skuId)
      if (res.success) {
        // 商品总库存更新
        goodsDetail.value.stock = res.data.goodStock
        // 更新sku
        goodsDetail.value.skus.forEach(sku => {
          if (sku.id === skuId) {
            sku.stock = res.data.skuStock
          }
        })
        return true
      }
      return false
    } catch (error) {
      console.error('更新商品库存失败:', error)
      return false
    }
  }


  /**
   * 预更新商品销量
   * @param {number} goodsId - 商品ID
   * @param {number} count - 变化数量，正数增加销量，负数减少销量
   * @param {number} skuId - SKU ID，如果有则更新具体SKU的销量
   */
  async function updateGoodsSold(goodsId, count, skuId) {

    try {
      // 先确保获取商品详情
      if (!goodsDetail.value || goodsDetail.value.id !== goodsId) {
        await fetchGoodsDetail(goodsId)
      }
      const res = await updateGoodsSoldApi(goodsId, count, skuId)
      if (res.success) {
        // 商品总销量更新
        goodsDetail.value.sold = res.data
        return true
      }
      return false
    } catch (error) {
      console.error('更新商品销量失败:', error)
      return false
    }
  }



  /**
   * 获取商品详情
   * @param {number} id - 商品ID
   */
  async function fetchGoodsDetail(id) {
    try {
      loading.value = true
      const res = await getGoodsDetail(id)
      if (res.success) {
        goodsDetail.value = res.data
        console.log(goodsDetail.value)
      }
      return goodsDetail.value
    } catch (error) {
      console.error('获取商品详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取商铺的商品列表
   * @param {number} shopId - 商铺ID
   */
  async function fetchShopGoods(shopId) {
    try {
      loading.value = true
      const res = await getShopGoods(shopId)
      if (res.success) {
        shopGoods.value = res.data
      }
      return shopGoods.value
    } catch (error) {
      console.error('获取商铺商品列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取随机商品列表
   * @param {number} count - 需要获取的商品数量
   */
  async function fetchRecommendGoods(count) {
    try {
      loading.value = true
      const res = await getRecommendGoods(count)
      if (res.success) {
        recommendGoods.value = res.data
      }
      return recommendGoods.value
    } catch (error) {
      console.error('获取随机商品失败:', error)
      return { success: false, data: [] }
    } finally {
      loading.value = false
    }
  }



  /**
   * 搜索商品
   * @param {string} keyword - 搜索关键词
   * @param {Object} params - 其他查询参数
   * @returns {Promise<Object>} - 搜索结果
   */
  async function searchGoodsByKeyword(keyword, params = {}) {
    try {
      loading.value = true
      const res = await searchGoods(keyword, params)
      if (res.success) {
        searchResults.value = res.data
        total.value = res.total || 0
      }
      return {
        list: searchResults.value,
        total: total.value
      }
    } catch (error) {
      console.error('搜索商品失败:', error)
      return { success: false, data: [] }
    } finally {
      loading.value = false
    }
  }


  // 计算属性
  const isLoading = computed(() => loading.value)
  const currentGoods = computed(() => goodsDetail.value)
  const currentShopGoods = computed(() => shopGoods.value)
  const currentRecommendGoods = computed(() => recommendGoods.value)

  return {
    // 状态
    goodsDetail,
    shopGoods,
    recommendGoods,
    loading,

    // 计算属性
    isLoading,
    currentGoods,
    currentShopGoods,
    currentRecommendGoods,

    // 方法
    fetchGoodsDetail,
    fetchShopGoods,
    fetchRecommendGoods,
    updateGoodsStock,
    updateGoodsSold,
    searchGoodsByKeyword
  }
})
