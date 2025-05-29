import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getUserCart,
  addToCart,
  updateCartItemCount,
  removeFromCart,
  clearCart,
  checkCartItem,
  checkAllItems,
  checkShopItems,
  removeCheckedItems
} from '../api/cart'
import { ElMessage } from 'element-plus'
import { useUserStore } from './user'

/**
 * 购物车状态管理
 */
export const useCartStore = defineStore('cart', () => {
  // 状态
  const cartList = ref([]) // 按商铺分组的购物车列表
  const loading = ref(false)

  // 获取用户状态
  const userStore = useUserStore()

  /**
   * 获取用户购物车
   */
  async function fetchUserCart() {
    try {
      loading.value = true

      // 判断用户是否登录
      if (userStore.isLogin) {
        // 已登录用户从服务器获取购物车
        const res = await getUserCart()
        if (res.success) {
          cartList.value = res.data || []
          if (res.message) {
            ElMessage.info(res.message)

          }
        }
      } else {
        // 未登录用户从本地存储获取购物车
        loadGuestCart()
      }

      return cartList.value
    } catch (error) {
      console.error('获取购物车失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 从本地存储加载游客购物车
   */
  function loadGuestCart() {
    try {
      const guestCartJson = localStorage.getItem('guest-cart')
      if (guestCartJson) {
        cartList.value = JSON.parse(guestCartJson) || []
      } else {
        cartList.value = []
      }
    } catch (error) {
      console.error('加载游客购物车失败:', error)
      cartList.value = []
    }
  }

  /**
   * 保存游客购物车到本地存储
   */
  function saveGuestCart() {
    try {
      localStorage.setItem('guest-cart', JSON.stringify(cartList.value))
    } catch (error) {
      console.error('保存游客购物车失败:', error)
    }
  }

  /**
   * 清除游客购物车
   */
  function clearGuestCart() {
    localStorage.removeItem('guest-cart')
    if (!userStore.isLogin) {
      cartList.value = []
    }
  }

  /**
   * 切换用户购物车（登录/登出时使用）
   * @param {string} userPhone 用户手机号，如果为null表示退出登录
   */
  async function switchUserCart(userPhone) {
    if (userPhone) {
      // 登录操作，从服务器获取购物车
      await fetchUserCart()
    } else {
      // 登出操作，加载游客购物车
      loadGuestCart()
    }
  }

  /**
   * 合并游客购物车到用户购物车
   */
  async function mergeGuestCart() {
    try {
      loading.value = true
      const guestCartJson = localStorage.getItem('guest-cart')

      if (!guestCartJson || guestCartJson === '[]') {
        // 如果游客购物车为空，直接获取用户购物车
        await fetchUserCart()
        return { success: true }
      }

      // 获取游客购物车数据
      const guestCart = JSON.parse(guestCartJson)
      let mergedCount = 0
      let errorCount = 0

      // 遍历游客购物车中的每个店铺
      for (const shop of guestCart) {
        // 遍历店铺中的每个商品
        for (const item of shop.items) {
          try {
            // 将每个商品添加到用户购物车
            const res = await addToCart({
              goodsId: item.goodsId,
              skuId: item.skuId,
              count: item.count,
              checked: item.checked
            })

            if (res.success) {
              mergedCount++
            } else {
              errorCount++
              console.error('合并购物车商品失败:', res.errorMsg)
            }
          } catch (error) {
            errorCount++
            console.error('合并购物车商品失败:', error)
          }
        }
      }

      // 合并完成后清除游客购物车
      clearGuestCart()

      // 重新获取用户购物车
      await fetchUserCart()

      if (errorCount > 0) {
        ElMessage.warning(`购物车已同步，${mergedCount}件商品同步成功，${errorCount}件同步失败`)
      } else {
        ElMessage.success(`购物车已同步，共${mergedCount}件商品`)
      }

      return { success: true, mergedCount, errorCount }
    } catch (error) {
      console.error('合并购物车失败:', error)
      ElMessage.error('购物车同步失败')
      return { success: false, message: '合并购物车失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加商品到购物车
   * @param {Object} cartItem - 购物车项
   * @param {number} cartItem.goodsId - 商品ID
   * @param {number} cartItem.skuId - 商品SKU ID (可以为null)
   * @param {number} cartItem.count - 商品数量
   * @param {boolean} [cartItem.checked=true] - 是否选中
   */
  async function addItemToCart(cartItem) {
    try {
      loading.value = true
      // 确保有skuId参数，即使是null
      const item = {
        ...cartItem,
        skuId: cartItem.skuId || null,
        checked: cartItem.checked ?? true
      }

      if (userStore.isLogin) {
        // 已登录用户，使用API添加到服务器
        const res = await addToCart(item)
        if (res.success) {
          // 添加成功后重新获取购物车数据
          await fetchUserCart()
          // 显示后端返回的消息
          ElMessage.success(res.message || '已添加到购物车')
        } else {
          // 显示错误信息
          ElMessage.error(res.errorMsg || '添加到购物车失败')
        }
        return res
      } else {
        // 未登录用户，添加到本地购物车
        addItemToGuestCart(item)
        saveGuestCart()
        ElMessage.success('已添加到购物车')
        return { success: true, message: '已添加到购物车' }
      }
    } catch (error) {
      console.error('添加到购物车失败:', error)
      ElMessage.error('添加到购物车失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加商品到游客购物车
   * @param {Object} item - 购物车项
   */
  function addItemToGuestCart(item) {
    // 查找商品所属商铺
    const shopId = item.shopId || 0 // 如果没有shopId，使用默认值
    const shopName = item.shopName || '默认店铺' // 如果没有shopName，使用默认值

    // 查找商铺购物车
    let shopCart = cartList.value.find(shop => shop.shopId === shopId)

    if (!shopCart) {
      // 创建新的商铺购物车
      shopCart = {
        shopId,
        shopName,
        items: []
      }
      cartList.value.push(shopCart)
    }

    // 查找是否已存在相同商品
    const existItem = shopCart.items.find(i =>
      i.goodsId === item.goodsId &&
      ((item.skuId === null && i.skuId === null) ||
        (item.skuId !== null && i.skuId === item.skuId))
    )

    if (existItem) {
      // 已存在则增加数量
      existItem.count += item.count
      existItem.checked = item.checked
    } else {
      // 不存在则添加新商品
      shopCart.items.push({
        goodsId: item.goodsId,
        skuId: item.skuId,
        goodsName: item.goodsName,
        goodsImages: item.goodsImages,
        price: item.price,
        count: item.count,
        checked: item.checked,
        skuName: item.skuName
      })
    }
  }

  /**
   * 更新购物车商品数量
   * @param {Object} params - 请求参数
   * @param {number} params.goodsId - 商品ID
   * @param {number} params.skuId - 商品SKU ID (可以为null)
   * @param {number} params.count - 商品数量
   */
  async function updateItemCount(params) {
    try {
      loading.value = true
      // 确保有skuId参数，即使是null
      const newParams = {
        ...params,
        skuId: params.skuId || null
      }

      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await updateCartItemCount(newParams)
        if (res.success) {
          // 更新成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，更新本地购物车
        updateGuestCartItemCount(newParams)
        saveGuestCart()
        return { success: true, message: '数量已更新' }
      }
    } catch (error) {
      console.error('更新购物车数量失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新游客购物车商品数量
   */
  function updateGuestCartItemCount(params) {
    for (const shop of cartList.value) {
      for (const item of shop.items) {
        if (item.goodsId === params.goodsId &&
          ((params.skuId === null && item.skuId === null) ||
            (params.skuId !== null && item.skuId === params.skuId))) {
          item.count = params.count
          return
        }
      }
    }
  }

  /**
   * 移除购物车商品
   * @param {Object} params - 请求参数
   * @param {number} params.goodsId - 商品ID
   * @param {number} params.skuId - 商品SKU ID (可以为null)
   */
  async function removeItem(params) {
    try {
      loading.value = true
      // 确保有skuId参数，即使是null
      const newParams = {
        ...params,
        skuId: params.skuId || null
      }

      if (userStore.isLogin) {
        // 已登录用户，使用API移除服务器数据
        const res = await removeFromCart(newParams)
        if (res.success) {
          // 移除成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，移除本地购物车商品
        removeGuestCartItem(newParams)
        saveGuestCart()
        return { success: true, message: '商品已移除' }
      }
    } catch (error) {
      console.error('移除购物车商品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 移除游客购物车商品
   */
  function removeGuestCartItem(params) {
    for (let i = 0; i < cartList.value.length; i++) {
      const shop = cartList.value[i]
      for (let j = 0; j < shop.items.length; j++) {
        const item = shop.items[j]
        if (item.goodsId === params.goodsId &&
          ((params.skuId === null && item.skuId === null) ||
            (params.skuId !== null && item.skuId === params.skuId))) {
          // 移除商品
          shop.items.splice(j, 1)
          // 如果商铺没有商品了，也移除商铺
          if (shop.items.length === 0) {
            cartList.value.splice(i, 1)
          }
          return
        }
      }
    }
  }

  /**
   * 清空购物车
   */
  async function clearUserCart() {
    try {
      loading.value = true
      if (userStore.isLogin) {
        // 已登录用户，使用API清空服务器购物车
        const res = await clearCart()
        if (res.success) {
          // 清空成功后重新获取购物车数据
          cartList.value = []
        }
        return res
      } else {
        // 未登录用户，清空本地购物车
        clearGuestCart()
        return { success: true, message: '购物车已清空' }
      }
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 选中或取消选中购物车商品
   * @param {Object} params - 请求参数
   * @param {number} params.goodsId - 商品ID
   * @param {number} params.skuId - 商品SKU ID (可以为null)
   * @param {boolean} params.checked - 是否选中
   */
  async function checkItem(params) {
    try {
      loading.value = true
      // 确保有skuId参数，即使是null
      const newParams = {
        ...params,
        skuId: params.skuId || null
      }

      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await checkCartItem(newParams)
        if (res.success) {
          // 更新成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，更新本地购物车
        checkGuestCartItem(newParams)
        saveGuestCart()
        return { success: true, message: '选中状态已更新' }
      }
    } catch (error) {
      console.error('更新商品选中状态失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 选中或取消选中游客购物车商品
   */
  function checkGuestCartItem(params) {
    for (const shop of cartList.value) {
      for (const item of shop.items) {
        if (item.goodsId === params.goodsId &&
          ((params.skuId === null && item.skuId === null) ||
            (params.skuId !== null && item.skuId === params.skuId))) {
          item.checked = params.checked
          return
        }
      }
    }
  }

  /**
   * 全选或取消全选
   * @param {boolean} checked - 是否全选
   */
  async function checkAll(checked) {
    try {
      loading.value = true
      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await checkAllItems(checked)
        if (res.success) {
          // 更新成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，更新本地购物车
        checkAllGuestCart(checked)
        saveGuestCart()
        return { success: true, message: checked ? '已全选' : '已取消全选' }
      }
    } catch (error) {
      console.error('全选/取消全选失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 全选或取消全选游客购物车
   */
  function checkAllGuestCart(checked) {
    for (const shop of cartList.value) {
      for (const item of shop.items) {
        item.checked = checked
      }
    }
  }

  /**
   * 选中或取消选中商铺商品
   * @param {Object} params - 请求参数
   * @param {number} params.shopId - 商铺ID
   * @param {boolean} params.checked - 是否选中
   */
  async function checkShopCart(params) {
    try {
      loading.value = true
      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await checkShopItems(params)
        if (res.success) {
          // 更新成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，更新本地购物车
        checkGuestShopCart(params)
        saveGuestCart()
        return { success: true, message: '店铺商品选中状态已更新' }
      }
    } catch (error) {
      console.error('更新商铺商品选中状态失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 选中或取消选中游客购物车商铺商品
   */
  function checkGuestShopCart(params) {
    const shop = cartList.value.find(s => s.shopId === params.shopId)
    if (shop) {
      for (const item of shop.items) {
        item.checked = params.checked
      }
    }
  }

  /**
   * 移除选中商品
   */
  async function removeChecked() {
    try {
      loading.value = true
      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await removeCheckedItems()
        if (res.success) {
          // 移除成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      } else {
        // 未登录用户，更新本地购物车
        removeCheckedGuestCart()
        saveGuestCart()
        return { success: true, message: '已移除选中商品' }
      }
    } catch (error) {
      console.error('移除选中商品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 移除选中的游客购物车商品
   */
  function removeCheckedGuestCart() {
    for (let i = 0; i < cartList.value.length; i++) {
      const shop = cartList.value[i]
      // 移除选中的商品
      shop.items = shop.items.filter(item => !item.checked)
      // 如果商铺没有商品了，也移除商铺
      if (shop.items.length === 0) {
        cartList.value.splice(i, 1)
        i-- // 调整索引
      }
    }
  }

  // 计算属性
  const isLoading = computed(() => loading.value)
  const shopCarts = computed(() => cartList.value || [])

  // 计算购物车总数量
  const totalCount = computed(() => {
    return shopCarts.value.reduce((total, shop) => {
      return total + shop.items.reduce((sum, item) => sum + item.count, 0)
    }, 0)
  })

  // 计算选中的商品总数量
  const selectedCount = computed(() => {
    return shopCarts.value.reduce((total, shop) => {
      return total + shop.items.reduce((sum, item) => sum + (item.checked ? item.count : 0), 0)
    }, 0)
  })

  // 计算选中的商品总价
  const selectedAmount = computed(() => {
    return shopCarts.value.reduce((total, shop) => {
      return total + shop.items.reduce((sum, item) => {
        return sum + (item.checked ? item.count * item.price : 0)
      }, 0)
    }, 0)
  })

  // 计算选中商品数量
  const checkedCount = computed(() => {
    return shopCarts.value.reduce((total, shop) => {
      return total + shop.items.reduce((sum, item) => sum + (item.checked ? item.count : 0), 0)
    }, 0)
  })

  // 计算总价格
  const totalPrice = computed(() => {
    return shopCarts.value.reduce((total, shop) => {
      return total + shop.items.reduce((sum, item) => {
        return sum + (item.checked ? item.count * item.price : 0)
      }, 0)
    }, 0)
  })

  // 按店铺分组的选中商品列表
  const checkedShops = computed(() => {
    // 结果数组
    const result = []

    // 遍历每个店铺
    for (const shop of shopCarts.value) {
      // 获取店铺中选中的商品
      const checkedItems = shop.items.filter(item => item.checked)

      // 如果有选中的商品，添加到结果中
      if (checkedItems.length > 0) {
        // 计算店铺商品总金额
        const totalAmount = checkedItems.reduce(
          (sum, item) => sum + item.price * item.count, 0
        )

        result.push({
          shopId: shop.shopId,
          shopName: shop.shopName,
          shopImage: shop.shopImage || '',
          items: checkedItems,
          totalAmount
        })
      }
    }

    return result
  })

  /**
   * 移除结算后的选中商品
   */
  async function removeCheckedItemsAfterCheckout() {
    try {
      loading.value = true
      if (userStore.isLogin) {
        // 已登录用户，使用API更新服务器
        const res = await removeCheckedItems()
        if (res.success) {
          // 移除成功后重新获取购物车数据
          await fetchUserCart()
        }
        return res
      }
    } catch (error) {
      console.error('移除选中商品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    cartList,
    loading,

    // 计算属性
    isLoading,
    shopCarts,
    totalCount,
    selectedCount,
    selectedAmount,
    checkedCount,
    totalPrice,
    checkedShops,

    // 方法
    fetchUserCart,
    addItemToCart,
    updateItemCount,
    removeItem,
    clearUserCart,
    checkItem,
    checkAll,
    checkShopCart,
    removeChecked,

    // 游客购物车相关方法
    loadGuestCart,
    saveGuestCart,
    clearGuestCart,
    switchUserCart,
    mergeGuestCart,
    removeCheckedItemsAfterCheckout
  }
}, {
  persist: false // 不使用 persist，因为我们手动管理游客购物车的本地存储
})
