import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addUserAddress,
  deleteUserAddress,
  getUserAddresses,
  setDefaultAddress,
  updateUserAddress
} from '../api/address'

/**
 * 地址管理状态
 */
export const useAddressStore = defineStore('address', () => {
  // 状态
  const addresses = ref([])
  const loading = ref(false)

  /**
   * 获取用户地址列表
   * @returns {Promise<Array>} - 地址列表
   */
  async function fetchAddresses() {
    try {
      loading.value = true
      const res = await getUserAddresses()
      if (res.success) {
        addresses.value = res.data
      }
      return addresses.value
    } catch (error) {
      console.error('获取地址列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加地址
   * @param {Object} addressData - 地址数据
   * @returns {Promise<boolean>} - 是否添加成功
   */
  async function addAddress(addressData) {
    try {
      loading.value = true
      const res = await addUserAddress(addressData)
      if (res.success) {
        await fetchAddresses() // 刷新列表
        ElMessage.success('添加地址成功')
        return true
      }
      ElMessage.error(res.message || '添加地址失败')
      return false
    } catch (error) {
      console.error('添加地址失败:', error)
      ElMessage.error('添加地址失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新地址
   * @param {Object} addressData - 地址数据
   * @returns {Promise<boolean>} - 是否更新成功
   */
  async function updateAddress(addressData) {
    try {
      loading.value = true
      const res = await updateUserAddress(addressData)
      if (res.success) {
        // 直接更新本地状态，避免重新请求
        const index = addresses.value.findIndex(addr => addr.id === addressData.id)
        if (index !== -1) {
          addresses.value[index] = { ...addresses.value[index], ...addressData }
        } else {
          await fetchAddresses() // 如果没找到就刷新整个列表
        }
        ElMessage.success('更新地址成功')
        return true
      }
      ElMessage.error(res.message || '更新地址失败')
      return false
    } catch (error) {
      console.error('更新地址失败:', error)
      ElMessage.error('更新地址失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除地址
   * @param {number} id - 地址ID
   * @returns {Promise<boolean>} - 是否删除成功
   */
  async function removeAddress(id) {
    try {
      loading.value = true
      const res = await deleteUserAddress(id)
      if (res.success) {
        // 直接更新本地状态，避免重新请求
        addresses.value = addresses.value.filter(addr => addr.id !== id)
        ElMessage.success('删除地址成功')
        return true
      }
      ElMessage.error(res.message || '删除地址失败')
      return false
    } catch (error) {
      console.error('删除地址失败:', error)
      ElMessage.error('删除地址失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置默认地址
   * @param {number} id - 地址ID
   * @returns {Promise<boolean>} - 是否设置成功
   */
  async function setDefault(id) {
    try {
      loading.value = true
      const res = await setDefaultAddress(id)
      if (res.success) {
        // 更新所有地址的默认状态
        addresses.value = addresses.value.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
        ElMessage.success('设置默认地址成功')
        return true
      }
      ElMessage.error(res.message || '设置默认地址失败')
      return false
    } catch (error) {
      console.error('设置默认地址失败:', error)
      ElMessage.error('设置默认地址失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const isLoading = computed(() => loading.value)
  const addressList = computed(() => addresses.value)
  const defaultAddress = computed(() => addresses.value.find(addr => addr.isDefault) || addresses.value[0])

  return {
    // 状态
    addresses,
    loading,

    // 计算属性
    isLoading,
    addressList,
    defaultAddress,

    // 方法
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault
  }
})
