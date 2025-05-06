import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getShopDetail, getShopList, getShopTypes, getShopsByType, searchShops, updateShopSalesApi } from '../api/shop'

/**
 * 商铺状态管理
 * 使用Pinia管理商铺相关状态
 */
export const useShopStore = defineStore('shop', () => {
  // 状态
  const shopTypes = ref([])
  const shopDetail = ref({})
  const shopList = ref([])
  const searchResults = ref([])
  const typeShops = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  /**
   * 获取商铺类型列表
   * @returns {Promise} - 商铺类型列表
   */
  async function fetchShopTypes() {
    try {
      loading.value = true
      const res = await getShopTypes()
      if (res.success) {
        shopTypes.value = res.data
      }
      return res.data
    } catch (error) {
      console.error('获取商铺类型失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取商铺详情
   * @param {number} id - 商铺ID
   * @returns {Promise} - 商铺详情
   */
  async function fetchShopDetail(id) {
    try {
      loading.value = true
      const res = await getShopDetail(id)
      if (res.success) {
        shopDetail.value = res.data
      }
      return shopDetail.value
    } catch (error) {
      console.error('获取商铺详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取推荐商铺列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 商铺列表
   */
  async function fetchShopList(params = {}) {
    try {
      loading.value = true
      const res = await getShopList(params)
      if (res.success) {
        shopList.value = res.data
      }
      return shopList.value
    } catch (error) {
      console.error('获取商铺列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 按类型获取商铺
   * @param {number} typeId - 商铺类型ID
   * @param {Object} params - 其他查询参数
   * @returns {Promise} - 商铺列表
   */
  async function fetchShopsByType(typeId, params = {}) {
    try {
      loading.value = true
      // 确保typeId和排序参数都能正确传递
      const queryParams = { 
        typeId, 
        ...params 
      }
      const res = await getShopsByType(typeId, queryParams)
      if (res.success) {
        typeShops.value = res.data.list
        total.value = res.data.total || 0
      }
      return {
        list: typeShops.value,
        total: total.value
      }
    } catch (error) {
      console.error('获取分类商铺失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 搜索商铺
   * @param {string} keyword - 搜索关键词
   * @param {Object} params - 其他查询参数
   * @returns {Promise} - 搜索结果
   */
  async function searchShopsByKeyword(keyword, params = {}) {
    try {
      loading.value = true
      const res = await searchShops(keyword, params)
      if (res.success) {
        searchResults.value = res.data.list
        total.value = res.data.total || 0
      }
      return {
        list: searchResults.value,
        total: total.value
      }
    } catch (error) {
      console.error('搜索商铺失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新商铺销量
   * @param {number} shopId - 商铺ID
   * @param {number} count - 变化数量，正数增加销量，负数减少销量
   */
  async function updateShopSales(shopId, count) {
    // 更新后端库存
    try {
      if (!shopDetail.value || shopDetail.value.id !== shopId) {
        await fetchShopDetail(shopId)
      }
      const res = await updateShopSalesApi(shopId, count)
      if (res.success) {
        shopDetail.value.sold = res.data
      }
      return true
    } catch (error) {
      console.error('更新商铺销量失败:', error)
      return false
    }
  }
  
  // 计算属性
  const isLoading = computed(() => loading.value)
  const currentShop = computed(() => shopDetail.value)
  const shopTypeList = computed(() => shopTypes.value)
  const currentShopList = computed(() => shopList.value)
  const typeFilteredShops = computed(() => typeShops.value)
  const currentSearchResults = computed(() => searchResults.value)
  const totalCount = computed(() => total.value)
  
  return {
    // 状态
    shopTypes,
    shopDetail,
    shopList,
    searchResults,
    typeShops,
    loading,
    total,
    
    // 计算属性
    isLoading,
    currentShop,
    shopTypeList,
    currentShopList,
    typeFilteredShops,
    currentSearchResults,
    totalCount,
    
    // 方法
    fetchShopTypes,
    fetchShopDetail,
    fetchShopList,
    fetchShopsByType,
    searchShopsByKeyword,
    updateShopSales
  }
})
