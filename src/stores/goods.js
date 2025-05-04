import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGoodsDetail, getShopGoods, getRandomGoods, updateGoodsSoldApi, updateGoodsStockApi, searchGoods } from '../api/goods'

/**
 * 商品状态管理
 */
export const useGoodsStore = defineStore('goods', () => {
  // 状态
  const goodsDetail = ref({})
  const shopGoods = ref([])
  const randomGoods = ref([]) // 添加随机商品列表状态
  const loading = ref(false)
  // 存储商品和SKU的库存和销量信息
  const goodsInventory = ref({}) // 格式: {商品id: {stock: 数量, sold: 销量, skus: {sku_id: {stock: 数量, sold: 销量}}}}

  // 初始化商品库存信息
  function initGoodsInventory(goodsId, goodsData) {
    if (!goodsInventory.value[goodsId]) {
      goodsInventory.value[goodsId] = {
        stock: goodsData.stock,
        sold: goodsData.sold,
        skus: {}
      }

      // 初始化每个SKU的库存和销量
      if (goodsData.skus?.length > 0) {
        goodsData.skus.forEach(sku => {
          goodsInventory.value[goodsId].skus[sku.id] = {
            stock: sku.stock || goodsData.stock,
            sold: sku.sold || 0
          }
        })
      }
    }
  }

  // 更新商品显示数据
  function updateGoodsDisplayData(goodsId, goodsData) {
    // 确保库存信息已初始化
    if (!goodsInventory.value[goodsId]) {
      initGoodsInventory(goodsId, goodsData)
    }

    // 更新显示的商品数据，使用持久化的库存和销量
    const inventory = goodsInventory.value[goodsId]
    return {
      ...goodsData,
      stock: inventory.stock,
      sold: inventory.sold,
      skus: goodsData.skus?.map(sku => ({
        ...sku,
        stock: inventory.skus[sku.id]?.stock ?? sku.stock,
        sold: inventory.skus[sku.id]?.sold ?? sku.sold
      }))
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
        initGoodsInventory(id, res.data)
        goodsDetail.value = updateGoodsDisplayData(id, res.data)
      }
      return res.data
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
      return res
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
  async function fetchRandomGoods(count = 5) {
    try {
      loading.value = true
      const res = await getRandomGoods(count)
      if (res.success) {
        randomGoods.value = res.data
      }
      return res
    } catch (error) {
      console.error('获取随机商品失败:', error)
      return { success: false, data: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新商品库存
   * @param {number} goodsId - 商品ID
   * @param {number} count - 变化数量，正数减少库存，负数增加库存
   * @param {number} skuId - SKU ID，如果有则更新具体SKU的库存
   */
  async function updateGoodsStock(goodsId, count, skuId = null) {
    if (!goodsInventory.value[goodsId]) {
      return false
    }

    try {
      await updateGoodsStockApi(goodsId, count, skuId)

      // 商品总库存更新
      const newStock = goodsInventory.value[goodsId].stock - count

      // 库存不能小于0
      if (newStock < 0) {
        return false
      }

      goodsInventory.value[goodsId].stock = newStock

      // 如果有skuId，同时更新SKU库存
      if (skuId && goodsInventory.value[goodsId].skus[skuId]) {
        const newSkuStock = goodsInventory.value[goodsId].skus[skuId].stock - count

        // SKU库存不能小于0
        if (newSkuStock < 0) {
          return false
        }

        goodsInventory.value[goodsId].skus[skuId].stock = newSkuStock
      }

      // 如果当前显示的是这个商品，更新显示数据
      if (goodsDetail.value.id === goodsId) {
        goodsDetail.value = updateGoodsDisplayData(goodsId, goodsDetail.value)
      }

      return true
    } catch (error) {
      console.error('更新商品库存失败:', error)
      return false
    }
  }

  /**
   * 更新商品销量
   * @param {number} goodsId - 商品ID
   * @param {number} count - 变化数量，正数增加销量，负数减少销量
   * @param {number} skuId - SKU ID，如果有则更新具体SKU的销量
   */
  async function updateGoodsSold(goodsId, count, skuId = null) {
    if (!goodsInventory.value[goodsId]) {
      return false
    }

    try {
      await updateGoodsSoldApi(goodsId, count, skuId)

      // 更新商品总销量
      const newSold = goodsInventory.value[goodsId].sold + count
      goodsInventory.value[goodsId].sold = Math.max(0, newSold)

      // 如果有skuId，同时更新SKU销量
      if (skuId && goodsInventory.value[goodsId].skus[skuId]) {
        const newSkuSold = goodsInventory.value[goodsId].skus[skuId].sold + count
        goodsInventory.value[goodsId].skus[skuId].sold = Math.max(0, newSkuSold)
      }

      // 如果当前显示的是这个商品，更新显示数据
      if (goodsDetail.value.id === goodsId) {
        goodsDetail.value = updateGoodsDisplayData(goodsId, goodsDetail.value)
      }

      return true
    } catch (error) {
      console.error('更新商品销量失败:', error)
      return false
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
        searchResults.value = res.data.list
        total.value = res.data.total || 0
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
  const currentRandomGoods = computed(() => randomGoods.value)

  return {
    // 状态
    goodsDetail,
    shopGoods,
    randomGoods,
    loading,
    goodsInventory,

    // 计算属性
    isLoading,
    currentGoods,
    currentShopGoods,
    currentRandomGoods,

    // 方法
    fetchGoodsDetail,
    fetchShopGoods,
    fetchRandomGoods,
    updateGoodsStock,
    updateGoodsSold,
    searchGoodsByKeyword
  }
}, {
  persist: {
    key: 'goods-storage',
    storage: localStorage,
    paths: ['goodsInventory']
  }
})
