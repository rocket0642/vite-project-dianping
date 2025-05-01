import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 购物车状态管理
 * 使用Pinia管理购物车数据
 */
export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const cartItems = ref([])
  
  /**
   * 计算总价
   * @returns {number} - 选中商品的总价（单位：分）
   */
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      if (item.checked) {
        return sum + item.price * item.count
      }
      return sum
    }, 0)
  })
  
  /**
   * 计算已选商品数量
   * @returns {number} - 选中商品的总数量
   */
  const checkedCount = computed(() => {
    return cartItems.value.reduce((count, item) => {
      if (item.checked) {
        return count + item.count
      }
      return count
    }, 0)
  })
  
  /**
   * 计算商品总数
   * @returns {number} - 购物车商品总数量
   */
  const totalCount = computed(() => {
    return cartItems.value.reduce((count, item) => {
      return count + item.count
    }, 0)
  })
  
  /**
   * 是否全选
   * @returns {boolean} - 是否所有商品都被选中
   */
  const isAllChecked = computed(() => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.checked)
  })
  
  /**
   * 已选商品列表
   * @returns {Array} - 所有选中的商品
   */
  const checkedItems = computed(() => {
    return cartItems.value.filter(item => item.checked)
  })
  
  /**
   * 按商铺分组的购物车商品
   * @returns {Object} - 按商铺ID分组的商品
   */
  const groupedItems = computed(() => {
    const groups = {}
    
    cartItems.value.forEach(item => {
      if (!groups[item.shopId]) {
        groups[item.shopId] = {
          shopId: item.shopId,
          shopName: item.shopName,
          items: []
        }
      }
      
      groups[item.shopId].items.push(item)
    })
    
    return Object.values(groups)
  })
  
  /**
   * 添加商品到购物车
   * @param {Object} product - 商品信息
   * @param {number} count - 商品数量
   * @param {boolean} checked - 是否选中
   */
  function addToCart(product, count = 1, checked = true) {
    // 查找购物车是否已有该商品
    const existingIndex = cartItems.value.findIndex(item => 
      item.id === product.id && 
      (product.skuId ? item.skuId === product.skuId : true)
    )
    
    if (existingIndex > -1) {
      // 如果已存在该商品，增加数量
      cartItems.value[existingIndex].count += count
    } else {
      // 如果不存在，添加新商品
      cartItems.value.push({
        ...product,
        count,
        checked
      })
    }
    
    // 持久化保存
    saveToLocal()
  }
  
  /**
   * 从购物车移除商品
   * @param {number} index - 商品索引
   */
  function removeFromCart(index) {
    cartItems.value.splice(index, 1)
    saveToLocal()
  }
  
  /**
   * 根据ID移除购物车商品
   * @param {number} id - 商品ID
   * @param {number} skuId - 商品SKU ID
   */
  function removeById(id, skuId = null) {
    const index = cartItems.value.findIndex(item => 
      item.id === id && (skuId ? item.skuId === skuId : true)
    )
    
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveToLocal()
    }
  }
  
  /**
   * 更新商品数量
   * @param {number} index - 商品索引
   * @param {number} count - 新数量
   */
  function updateItemCount(index, count) {
    if (count < 1) count = 1
    cartItems.value[index].count = count
    saveToLocal()
  }
  
  /**
   * 切换商品选中状态
   * @param {number} index - 商品索引
   */
  function toggleItemCheck(index) {
    cartItems.value[index].checked = !cartItems.value[index].checked
    saveToLocal()
  }
  
  /**
   * 按ID切换商品选中状态
   * @param {number} id - 商品ID 
   * @param {number} skuId - 商品SKU ID
   */
  function toggleItemCheckById(id, skuId = null) {
    const index = cartItems.value.findIndex(item => 
      item.id === id && (skuId ? item.skuId === skuId : true)
    )
    
    if (index > -1) {
      cartItems.value[index].checked = !cartItems.value[index].checked
      saveToLocal()
    }
  }
  
  /**
   * 切换商铺所有商品的选中状态
   * @param {number} shopId - 商铺ID
   * @param {boolean} checked - 选中状态
   */
  function toggleShopItems(shopId, checked) {
    cartItems.value.forEach(item => {
      if (item.shopId === shopId) {
        item.checked = checked
      }
    })
    saveToLocal()
  }
  
  /**
   * 全选/取消全选
   * @param {boolean} checked - 是否全选
   */
  function toggleAllCheck(checked) {
    cartItems.value.forEach(item => {
      item.checked = checked
    })
    saveToLocal()
  }
  
  /**
   * 清空购物车
   */
  function clearCart() {
    cartItems.value = []
    saveToLocal()
  }
  
  /**
   * 删除选中商品
   */
  function removeCheckedItems() {
    cartItems.value = cartItems.value.filter(item => !item.checked)
    saveToLocal()
  }
  
  /**
   * 持久化保存到localStorage，与用户ID关联
   */
  function saveToLocal() {
    // 获取当前用户ID
    const userId = localStorage.getItem('userId')
    // 如果用户已登录，将购物车与用户ID关联
    if (userId) {
      localStorage.setItem(`cart-items-${userId}`, JSON.stringify(cartItems.value))
    } else {
      // 未登录用户使用默认购物车
      localStorage.setItem('cart-items-guest', JSON.stringify(cartItems.value))
    }
  }
  
  /**
   * 从localStorage加载，根据用户ID加载对应购物车
   */
  function loadFromLocal() {
    // 获取当前用户ID
    const userId = localStorage.getItem('userId')
    // 根据用户ID获取对应购物车
    const saved = userId 
      ? localStorage.getItem(`cart-items-${userId}`) 
      : localStorage.getItem('cart-items-guest')
    
    // 兼容旧版本，如果没有找到用户关联的购物车，尝试加载旧版本的购物车数据
    if (!saved && !userId) {
      const oldCart = localStorage.getItem('cart-items')
      if (oldCart) {
        try {
          cartItems.value = JSON.parse(oldCart)
          // 迁移旧数据到新格式
          saveToLocal()
          // 删除旧数据
          localStorage.removeItem('cart-items')
          return
        } catch (error) {
          console.error('旧购物车数据解析失败', error)
        }
      }
    }
    
    if (saved) {
      try {
        cartItems.value = JSON.parse(saved)
      } catch (error) {
        console.error('购物车数据解析失败', error)
        cartItems.value = []
      }
    } else {
      cartItems.value = []
    }
  }
  
  // 初始化时加载本地数据
  loadFromLocal()
  
  return {
    // 状态
    cartItems,
    
    // 计算属性
    totalPrice,
    checkedCount,
    totalCount,
    isAllChecked,
    checkedItems,
    groupedItems,
    
    // 方法
    addToCart,
    removeFromCart,
    removeById,
    updateItemCount,
    toggleItemCheck,
    toggleItemCheckById,
    toggleShopItems,
    toggleAllCheck,
    clearCart,
    removeCheckedItems,
    loadFromLocal,
    saveToLocal
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage
      }
    ]
  }
})
