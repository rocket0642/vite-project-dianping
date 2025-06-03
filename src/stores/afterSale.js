import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyAfterSale, getAfterSaleByOrderId, getAfterSaleDetail, getAfterSaleList, handleAfterSale } from '../api/afterSale'

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
            status: 1, // 默认为处理中
            orderId: null // 添加订单ID筛选
        },
        total: 0
    })


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
            2: '换货',
            3: '维修',
            4: '仅退款'
        }
        return typeMap[type] || '未知类型'
    }

    /**
     * 获取售后列表
     * @param {Object} params - 查询参数
     * @returns {Promise} - 请求结果
     */
    async function fetchAfterSaleList(params) {
        try {
            loading.value = true
            const res = await getAfterSaleList(params)

            if (res.success) {
                afterSaleList.value = res.data || []
                listPageState.value.total = res.total || 0
                return true
            } else {
                ElMessage.error(res.message || '获取售后列表失败')
                return false
            }
        } catch (error) {
            console.error('获取售后列表失败:', error)
            ElMessage.error('获取售后列表失败')
        } finally {
            loading.value = false
        }
    }

    /**
     * 管理员处理售后
     * @param {Object} data - 处理数据
     * @returns {Promise} - 请求结果
     */
    async function handleAdminAfterSale(data) {
        try {
            loading.value = true
            const res = await handleAfterSale(data)
            if (res.success) {
                ElMessage.success('售后处理成功')
                return true
            } else {
                ElMessage.error(res.message || '售后处理失败')
                return false
            }
        } catch (error) {
            console.error('管理员处理售后失败:', error)
            ElMessage.error('管理员处理售后失败')
        } finally {
            loading.value = false
        }
    }
    return {
        // 状态
        afterSaleList,
        afterSaleDetail,
        orderAfterSales,
        loading,
        listPageState,

        // 方法
        fetchAfterSaleDetail,
        fetchOrderAfterSales,
        submitAfterSale,
        getAfterSaleStatusText,
        getAfterSaleTypeText,
        fetchAfterSaleList,
        handleAdminAfterSale
    }
}) 