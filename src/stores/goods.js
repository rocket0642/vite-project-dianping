import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGoodsDetail, getShopGoods, getRandomGoods } from '../api/goods'

/**
 * 商品状态管理
 */
export const useGoodsStore = defineStore('goods', () => {
  // 状态
  const goodsDetail = ref({})
  const shopGoods = ref([])
  const loading = ref(false)
  // 存储商品和SKU的库存和销量信息
  const goodsInventory = ref({}) // 格式: {商品id: {stock: 数量, sold: 销量, skus: {sku_id: {stock: 数量, sold: 销量}}}}
  
  /**
   * 获取商品详情
   * @param {number} id - 商品ID
   */
  async function fetchGoodsDetail(id) {
    try {
      loading.value = true
      const res = await getGoodsDetail(id)
      if (res.success) {
        // 初始化商品库存和销量
        if (!goodsInventory.value[id]) {
          goodsInventory.value[id] = {
            stock: res.data.stock,
            sold: res.data.sold,
            skus: {}
          }
          
          // 初始化每个SKU的库存和销量
          if (res.data.skus && res.data.skus.length > 0) {
            res.data.skus.forEach(sku => {
              if (!goodsInventory.value[id].skus[sku.id]) {
                goodsInventory.value[id].skus[sku.id] = {
                  stock: sku.stock || res.data.stock,
                  sold: sku.sold || 0
                }
              }
            })
          }
        }
        
        // 更新显示的商品数据，使用持久化的库存和销量
        goodsDetail.value = {
          ...res.data,
          stock: goodsInventory.value[id].stock,
          sold: goodsInventory.value[id].sold,
        }
        
        // 更新每个SKU的库存和销量
        if (goodsDetail.value.skus && goodsDetail.value.skus.length > 0) {
          goodsDetail.value.skus = goodsDetail.value.skus.map(sku => {
            const skuInventory = goodsInventory.value[id].skus[sku.id]
            if (skuInventory) {
              return {
                ...sku,
                stock: skuInventory.stock,
                sold: skuInventory.sold
              }
            }
            return sku
          })
        }
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
      return res.data
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
   * @returns {Array} - 随机商品列表
   */
  async function fetchRandomGoods(count = 5) {
    try {
      loading.value = true
      // 从API获取随机商品
      const res = await getRandomGoods(count)
      
      if (res.success) {
        return res.data
      }
      return []
    } catch (error) {
      console.error('获取随机商品失败:', error)
      return []
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
  function updateGoodsStock(goodsId, count, skuId = null) {
    if (!goodsInventory.value[goodsId]) {
      return false
    }
    
    // 商品总库存始终更新
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
      
      // 如果当前显示的是这个商品，也更新显示中的SKU库存
      if (goodsDetail.value.id === goodsId && goodsDetail.value.skus) {
        const sku = goodsDetail.value.skus.find(s => s.id === skuId)
        if (sku) {
          sku.stock = newSkuStock
        }
      }
    }
    
    // 如果当前显示的是这个商品，也更新显示
    if (goodsDetail.value.id === goodsId) {
      goodsDetail.value.stock = newStock
    }
    
    return true
  }
  
  /**
   * 更新商品销量
   * @param {number} goodsId - 商品ID
   * @param {number} count - 变化数量，正数增加销量，负数减少销量
   * @param {number} skuId - SKU ID，如果有则更新具体SKU的销量
   */
  function updateGoodsSold(goodsId, count, skuId = null) {
    if (!goodsInventory.value[goodsId]) {
      return false
    }
    
    // 更新商品总销量
    const newSold = goodsInventory.value[goodsId].sold + count
    
    // 销量不能小于0
    if (newSold < 0) {
      goodsInventory.value[goodsId].sold = 0
    } else {
      goodsInventory.value[goodsId].sold = newSold
    }
    
    // 如果有skuId，同时更新SKU销量
    if (skuId && goodsInventory.value[goodsId].skus[skuId]) {
      const newSkuSold = goodsInventory.value[goodsId].skus[skuId].sold + count
      
      // 销量不能小于0
      if (newSkuSold < 0) {
        goodsInventory.value[goodsId].skus[skuId].sold = 0
      } else {
        goodsInventory.value[goodsId].skus[skuId].sold = newSkuSold
      }
      
      // 如果当前显示的是这个商品，也更新显示中的SKU销量
      if (goodsDetail.value.id === goodsId && goodsDetail.value.skus) {
        const sku = goodsDetail.value.skus.find(s => s.id === skuId)
        if (sku) {
          sku.sold = Math.max(0, newSkuSold)
        }
      }
    }
    
    // 如果当前显示的是这个商品，也更新显示
    if (goodsDetail.value.id === goodsId) {
      goodsDetail.value.sold = goodsInventory.value[goodsId].sold
    }
    
    return true
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  const currentGoods = computed(() => goodsDetail.value)
  const currentShopGoods = computed(() => shopGoods.value)
  
  return {
    // 状态
    goodsDetail,
    shopGoods,
    loading,
    goodsInventory,
    
    // 计算属性
    isLoading,
    currentGoods,
    currentShopGoods,
    
    // 方法
    fetchGoodsDetail,
    fetchShopGoods,
    fetchRandomGoods,
    updateGoodsStock,
    updateGoodsSold
  }
}, {
  persist: {
    key: 'goods-inventory',
    storage: localStorage,
    paths: ['goodsInventory'],
    serializer: {
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return { goodsInventory: parsed.goodsInventory };
      },
      serialize: (state) => {
        return JSON.stringify({ goodsInventory: state.goodsInventory });
      }
    }
  }
})
