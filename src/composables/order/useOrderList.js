import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { useOrderStore } from '../../stores/order'

export function useOrderList(router) {
    const userStore = useUserStore()
    const orderStore = useOrderStore()
    const loading = ref(false)

    // 分页状态
    const pageSize = ref(5)
    const activeTab = computed({
        get: () => orderStore.orderListPageState.activeTab,
        set: (val) => orderStore.orderListPageState.activeTab = val
    })
    const paginationState = computed({
        get: () => orderStore.orderListPageState.paginationState,
        set: (val) => orderStore.orderListPageState.paginationState = val
    })
    const currentPage = computed({
        get: () => paginationState.value[activeTab.value].currentPage,
        set: (val) => {
            orderStore.orderListPageState.paginationState[activeTab.value].currentPage = val
        }
    })
    const total = computed(() => paginationState.value[activeTab.value].total)
    const orders = computed(() => orderStore.orderList)

    // tab到状态映射
    const tabToStatusMap = {
        'all': undefined,
        'paid': [2, 4, 5],
        'unpaid': 1,
        'canceled': 3,
        'unreceived': 4,
        'uncommented': 5,
        'afterSale': 6
    }

    /**
     * 加载订单列表
     */
    const loadOrders = async () => {
        if (!userStore.isLogin) {
            ElMessage.warning('请先登录')
            router.push('/login?redirect=/order/list')
            return
        }

        loading.value = true
        try {
            const params = {
                current: currentPage.value,
                pageSize: pageSize.value
            }

            // 特殊处理售后标签
            if (activeTab.value === 'afterSale') {
                params.afterSaleStatus = true
            } else {
                // 处理其他标签的状态
                const statusValue = tabToStatusMap[activeTab.value]
                if (Array.isArray(statusValue)) {
                    params.statuses = statusValue.join(',')
                } else if (statusValue !== undefined) {
                    params.status = statusValue
                }
            }

            // 处理未评价标签
            if (activeTab.value === 'uncommented') {
                params.uncommented = true
            }

            const result = await orderStore.fetchOrderList(params)
            orderStore.orderListPageState.paginationState[activeTab.value].total = result.total || 0

            return result
        } catch (error) {
            console.error('加载订单列表失败:', error)
            ElMessage.error('加载订单失败，请稍后重试')
        } finally {
            loading.value = false
        }
    }

    /**
     * 切换标签页
     */
    const handleTabChange = (tab) => {
        orderStore.orderListPageState.activeTab = tab
        router.push({ query: { status: tabToStatusMap[tab] } })
        loadOrders()
    }

    /**
     * 分页变化
     */
    const handlePageChange = (page) => {
        orderStore.orderListPageState.paginationState[activeTab.value].currentPage = page
        loadOrders()
    }

    return {
        loading,
        orders,
        activeTab,
        currentPage,
        pageSize,
        total,
        tabToStatusMap,
        loadOrders,
        handleTabChange,
        handlePageChange
    }
}
