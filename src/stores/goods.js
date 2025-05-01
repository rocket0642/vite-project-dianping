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
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  const currentGoods = computed(() => goodsDetail.value)
  const currentShopGoods = computed(() => shopGoods.value)
  
  return {
    // 状态
    goodsDetail,
    shopGoods,
    loading,
    
    // 计算属性
    isLoading,
    currentGoods,
    currentShopGoods,
    
    // 方法
    fetchGoodsDetail,
    fetchShopGoods,
    fetchRandomGoods
  }
}, {
  persist: false // 商品数据不需要持久化
})
