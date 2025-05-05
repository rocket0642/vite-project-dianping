import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUserStore } from './user'
import { useGoodsStore } from './goods'
import { useShopStore } from './shop'
import { ElMessage } from 'element-plus'

/**
 * 购物车状态管理
 * 使用Pinia管理购物车数据
 */
export const useCartStore = defineStore('cart', () => {
  // 引入用户store
  const userStore = useUserStore()
  const goodsStore = useGoodsStore()
  const shopStore = useShopStore()

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
          shopImage: item.shopImage,
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
  async function addToCart(product, count, checked = true) {
    try {
      // 先执行库存更新，并等待完成
      const stockUpdated = await goodsStore.updateGoodsStock(product.id, count, product.skuId)
      if (!stockUpdated) {
        return false
      }

      // 等待销量更新
      await goodsStore.updateGoodsSold(product.id, count, product.skuId)

      // 更新销量（SKU级别）
      await shopStore.updateShopSales(product.shopId, count)

      // 查找购物车是否已有该商品
      const existingIndex = cartItems.value.findIndex(item =>
        item.id === product.id &&
        (product.skuId ? item.skuId === product.skuId : true)
      )

      if (existingIndex > -1) {
        cartItems.value[existingIndex].count += count
      } else {
        cartItems.value.push({
          ...product,
          count,
          checked
        })
      }
      saveCurrentCart()
      return true
    } catch (error) {
      ElMessage.error('添加失败' + error)
      return false
    }
  }

  /**
   * 从购物车移除商品
   * @param {number} index - 商品索引
   */
  async function removeFromCart(index) {
    try {
      const item = cartItems.value[index]
      // 恢复库存，但不减少销量，考虑SKU
      await goodsStore.updateGoodsStock(item.id, -item.count, item.skuId)

      cartItems.value.splice(index, 1)
      saveCurrentCart()
    } catch (error) {
      ElMessage.error('移除失败' + error)
    }
  }

  /**
   * 根据ID移除购物车商品
   * @param {number} id - 商品ID
   * @param {number} skuId - 商品SKU ID
   */
  async function removeById(id, skuId = null) {
    try {
      const index = cartItems.value.findIndex(item =>
        item.id === id && (skuId ? item.skuId === skuId : true)
      )

      if (index > -1) {
        const item = cartItems.value[index]
        // 恢复库存，但不减少销量，考虑SKU
        await goodsStore.updateGoodsStock(item.id, -item.count, item.skuId)

        cartItems.value.splice(index, 1)
        saveCurrentCart()
      }
    } catch (error) {
      ElMessage.error('移除失败' + error)
    }
  }

  /**
   * 更新商品数量
   * @param {number} index - 商品索引
   * @param {number} count - 新数量
   */
  async function updateItemCount(index, count) {
    if (count < 1) count = 1

    try {
      const item = cartItems.value[index]
      const oldCount = item.count
      const diffCount = count - oldCount

      const stockUpdated = await goodsStore.updateGoodsStock(item.id, diffCount, item.skuId)
      if (!stockUpdated) {
        ElMessage.warning('商品库存不足')
        return
      }

      // 更新销量
      await goodsStore.updateGoodsSold(item.id, diffCount, item.skuId)
      await shopStore.updateShopSales(item.shopId, diffCount)


      // 更新购物车数量
      cartItems.value[index].count = count
      saveCurrentCart()
    } catch (error) {
      ElMessage.error('更新失败' + error)
    }
  }

  /**
   * 切换商品选中状态
   * @param {number} index - 商品索引
   */
  function toggleItemCheck(index) {
    cartItems.value[index].checked = !cartItems.value[index].checked
    saveCurrentCart()
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
    }
    saveCurrentCart()
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
    saveCurrentCart()
  }

  /**
   * 全选/取消全选
   * @param {boolean} checked - 是否全选
   */
  function toggleAllCheck(checked) {
    cartItems.value.forEach(item => {
      item.checked = checked
    })
    saveCurrentCart()
  }

  /**
   * 清空购物车
   */
  function clearCart() {
    try {
      // 恢复所有商品库存，注意SKU
      cartItems.value.forEach(async item => {
        await goodsStore.updateGoodsStock(item.id, -item.count, item.skuId)
      })

      cartItems.value = []
      saveCurrentCart()
    } catch (error) {
      ElMessage.error('清空失败' + error)
    }
  }

  /**
   * 删除选中商品
   */
  function removeCheckedItems() {
    cartItems.value = cartItems.value.filter(item => !item.checked)
    saveCurrentCart()
  }

  // 新增：结算后移除选中的商品，不影响库存和销量（因为已经被订单处理）
  function removeCheckedItemsAfterCheckout() {
    cartItems.value = cartItems.value.filter(item => !item.checked)
    saveCurrentCart()
  }

  // 监听用户登录状态变化，使用电话号码作为标识
  watch(() => userStore.userPhone, (newUserPhone, oldUserPhone) => {
    // 检测从无电话号码到有电话号码的变化（表示用户刚登录）
    if (newUserPhone && !oldUserPhone) {
      // 用户刚登录，合并游客购物车到用户购物车
      mergeGuestCartToUserCart(newUserPhone);
    } else {
      // 其他情况正常切换购物车
      switchUserCart(newUserPhone);
    }
  }, { immediate: true })

  /**
   * 根据用户ID切换购物车
   * @param {string|null} userPhone - 用户ID
   */
  function switchUserCart(userPhone) {

    // 然后加载对应用户的购物车
    const cartKey = userPhone ? `cart-items-${userPhone}` : 'cart-items-guest'
    const savedCart = localStorage.getItem(cartKey)

    if (savedCart) {
      try {
        cartItems.value = JSON.parse(savedCart)
      } catch (error) {
        console.error('购物车数据解析失败', error)
        cartItems.value = []
      }
    } else {
      cartItems.value = []
    }
  }

  /**
   * 保存当前购物车到localStorage
   */
  function saveCurrentCart() {
    const currentUserPhone = useUserStore().userPhone
    const cartKey = currentUserPhone ? `cart-items-${currentUserPhone}` : 'cart-items-guest'
    localStorage.setItem(cartKey, JSON.stringify(cartItems.value))
  }

  // 添加通过商品对象操作的方法
  function updateItemCountByObject(item, count) {
    const index = cartItems.value.indexOf(item)
    if (index > -1) {
      updateItemCount(index, count)
    }
  }

  function removeItemByObject(item) {
    const index = cartItems.value.indexOf(item)
    if (index > -1) {
      removeFromCart(index)
    }
  }

  /**
   * 将游客购物车合并到用户购物车并清空游客购物车
   * @param {string} userPhone - 用户电话号码
   */
  function mergeGuestCartToUserCart(userPhone) {
    // 1. 获取游客购物车数据
    const guestCartKey = 'cart-items-guest';
    const guestCartData = JSON.parse(localStorage.getItem(guestCartKey) || '[]');

    // 2. 如果游客购物车为空，则直接加载用户购物车
    if (guestCartData.length === 0) {
      switchUserCart(userPhone);
      return;
    }

    // 3. 获取用户购物车数据
    const userCartKey = `cart-items-${userPhone}`;
    const userCartData = JSON.parse(localStorage.getItem(userCartKey) || '[]');

    // 4. 合并购物车数据(避免重复商品)
    guestCartData.forEach(guestItem => {
      const existingItemIndex = userCartData.findIndex(userItem =>
        userItem.id === guestItem.id &&
        (guestItem.skuId ? userItem.skuId === guestItem.skuId : true)
      );

      if (existingItemIndex > -1) {
        // 如果用户购物车已有该商品，合并数量
        userCartData[existingItemIndex].count += guestItem.count;
      } else {
        // 否则添加到用户购物车
        userCartData.push(guestItem);
      }
    });

    // 5. 保存合并后的用户购物车
    localStorage.setItem(userCartKey, JSON.stringify(userCartData));

    // 6. 清空游客购物车
    localStorage.removeItem(guestCartKey);

    // 7. 加载用户购物车数据到当前state
    cartItems.value = userCartData;

    console.log(`已将游客购物车(${guestCartData.length}件商品)合并到用户[${userPhone}]的购物车`);
  }

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
    switchUserCart,
    updateItemCountByObject,
    removeItemByObject,
    removeCheckedItemsAfterCheckout
  }
}, {
  persist: false
})
