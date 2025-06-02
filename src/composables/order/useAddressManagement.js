import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAddressStore } from '../../stores/address'
import { useUserStore } from '../../stores/user'

export function useAddressManagement(router) {
    const addressStore = useAddressStore()
    const userStore = useUserStore()

    const addressDialogVisible = ref(false)
    const addresses = ref([])
    const addressesLoading = ref(false)
    const selectedAddress = ref(null)
    const currentOrderId = ref(null)

    /**
     * 加载用户地址列表
     */
    const loadUserAddresses = async () => {
        addressesLoading.value = true
        try {
            if (!userStore.isLogin) {
                ElMessage.warning('请先登录')
                router.push('/login?redirect=/order/list')
                return
            }

            await addressStore.fetchAddresses()
            addresses.value = addressStore.addressList || []

            console.log('加载的地址列表:', addresses.value)

            if (addresses.value.length > 0) {
                selectedAddress.value = addressStore.defaultAddress || addresses.value[0]
            } else {
                selectedAddress.value = null
            }
        } catch (error) {
            console.error('加载地址列表失败:', error)
            ElMessage.error('加载地址列表失败，请稍后重试')
        } finally {
            addressesLoading.value = false
        }
    }

    /**
     * 打开地址选择对话框
     */
    const openAddressDialog = (orderId) => {
        currentOrderId.value = orderId
        loadUserAddresses().then(() => {
            addressDialogVisible.value = true
        })
    }

    /**
     * 更新订单地址
     */
    const updateOrderAddress = async (address, orders) => {
        if (!address) {
            ElMessage.warning('请选择收货地址')
            return
        }

        try {
            const order = orders.find(o => o.id === currentOrderId.value)
            if (order) {
                order.addressId = address.id
                order.addressName = address.name
                order.addressPhone = address.phone
                order.addressDetail = address.address
            }

            ElMessage.success('收货地址已更新')
        } catch (error) {
            console.error('更新地址失败:', error)
            ElMessage.error('更新地址失败，请稍后重试')
        }
    }

    return {
        addressDialogVisible,
        addresses,
        addressesLoading,
        selectedAddress,
        currentOrderId,
        loadUserAddresses,
        openAddressDialog,
        updateOrderAddress
    }
}
