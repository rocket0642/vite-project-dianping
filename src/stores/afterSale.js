import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyAfterSale, getAfterSaleByOrderId, getAfterSaleDetail, getUserAfterSales } from '../api/afterSale'

/**
 * 售后状态管理
 */
export const useAfterSaleStore = defineStore('afterSale', () => {
    // 状态
    const afterSaleList = ref([])
    const afterSaleDetail = ref(null)
    const orderAfterSales = ref({}) // 按订单ID索引的售后记录
    const loading = ref(false)
    const listPageState = ref({ // 列表页状态
        filter: {
            current: 1,
            pageSize: 10,
            status: null
        },
        total: 0
    })

    /**
     * 获取用户的售后记录列表
     * @param {Object} params - 查询参数
     * @returns {Promise} - 请求结果
     */
    async function fetchAfterSaleList(params = {}) {
        try {
            loading.value = true
            const queryParams = {
                current: listPageState.value.filter.current,
                size: listPageState.value.filter.pageSize,
                status: listPageState.value.filter.status,
                ...params
            }
            const res = await getUserAfterSales(queryParams)

            if (res.success) {
                afterSaleList.value = res.data || []
                listPageState.value.total = res.total || 0
                return { data: res.data, total: res.total }
            } else {
                ElMessage.error(res.message || '获取售后记录失败')
                return { data: [], total: 0 }
            }
        } catch (error) {
            console.error('获取售后记录失败:', error)
            ElMessage.error('获取售后记录失败')
            return { data: [], total: 0 }
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取售后详情
     * @param {number} id - 售后ID
     * @returns {Promise} - 请求结果
     */
    async function fetchAfterSaleDetail(id) {
        try {
            loading.value = true
            const res = await getAfterSaleDetail(id)

            if (res.success) {
                afterSaleDetail.value = res.data
                return res.data
            } else {
                ElMessage.error(res.message || '获取售后详情失败')
                return null
            }
        } catch (error) {
            console.error('获取售后详情失败:', error)
            ElMessage.error('获取售后详情失败')
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取订单的售后记录
     * @param {string} orderId - 订单ID
     * @returns {Promise} - 请求结果
     */
    async function fetchOrderAfterSales(orderId) {
        try {
            loading.value = true
            const res = await getAfterSaleByOrderId(orderId)

            if (res.success) {
                orderAfterSales.value[orderId] = res.data || []
                return res.data
            } else {
                ElMessage.error(res.message || '获取订单售后记录失败')
                return []
            }
        } catch (error) {
            console.error('获取订单售后记录失败:', error)
            ElMessage.error('获取订单售后记录失败')
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * 申请售后
     * @param {Object} data - 售后申请数据
     * @returns {Promise} - 请求结果
     */
    async function submitAfterSale(data) {
        try {
            loading.value = true
            const res = await applyAfterSale(data)

            if (res.success) {
                ElMessage.success('售后申请提交成功')
                // 刷新订单的售后记录
                if (data.orderId) {
                    await fetchOrderAfterSales(data.orderId)
                }
                return res.data
            } else {
                ElMessage.error(res.message || '售后申请提交失败')
                return null
            }
        } catch (error) {
            console.error('售后申请提交失败:', error)
            ElMessage.error('售后申请提交失败')
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取售后状态文本
     * @param {number} status - 状态码
     * @returns {string} - 状态文本
     */
    function getAfterSaleStatusText(status) {
        const statusMap = {
            1: '处理中',
            2: '已完成',
            3: '已拒绝'
        }
        return statusMap[status] || '未知状态'
    }

    /**
     * 获取售后类型文本
     * @param {number} type - 类型码
     * @returns {string} - 类型文本
     */
    function getAfterSaleTypeText(type) {
        const typeMap = {
            1: '退货退款',
            2: '仅退款',
            3: '换货',
            4: '维修'
        }
        return typeMap[type] || '未知类型'
    }

    return {
        // 状态
        afterSaleList,
        afterSaleDetail,
        orderAfterSales,
        loading,
        listPageState,

        // 方法
        fetchAfterSaleList,
        fetchAfterSaleDetail,
        fetchOrderAfterSales,
        submitAfterSale,
        getAfterSaleStatusText,
        getAfterSaleTypeText
    }
}) 