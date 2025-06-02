import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useCountdown(orders, loadOrders, orderStore) {
    const countdowns = ref({})
    const timers = ref({})

    /**
     * 启动所有倒计时
     */
    const startCountdowns = () => {
        clearAllTimers()

        orders.value.forEach(order => {
            if (order.status === 1) {
                initOrderCountdown(order)
            }
        })
    }

    /**
     * 初始化订单倒计时
     */
    const initOrderCountdown = (order) => {
        const orderId = order.id

        const createTime = new Date(order.createTime).getTime()
        const expireTime = createTime + 20 * 60 * 1000
        const now = Date.now()

        let remainingTime = expireTime - now

        if (remainingTime <= 0) {
            cancelExpiredOrder(orderId)
            return
        }

        updateCountdownDisplay(orderId, remainingTime)

        timers.value[orderId] = setInterval(() => {
            remainingTime -= 1000

            if (remainingTime <= 0) {
                clearInterval(timers.value[orderId])
                cancelExpiredOrder(orderId)
            } else {
                updateCountdownDisplay(orderId, remainingTime)
            }
        }, 1000)
    }

    /**
     * 更新倒计时显示
     */
    const updateCountdownDisplay = (orderId, milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000)
        const seconds = Math.floor((milliseconds % 60000) / 1000)
        countdowns.value[orderId] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    /**
     * 取消过期订单
     */
    const cancelExpiredOrder = async (orderId) => {
        try {
            await loadOrders()
            if (orders.value && orders.value.status !== 3 && orders.value.status !== 2) {
                const res = await orderStore.cancelUserOrder({
                    orderId,
                    cancelReason: `超时自动取消`
                })
                if (!res.success) {
                    ElMessage.error(res.errorMsg || '订单取消失败')
                } else {
                    ElMessage.info(`订单 ${orderId} 已超时自动取消`)
                    await loadOrders()
                }
            } else {
                ElMessage.info(`订单 ${orderId} 已超时自动取消`)
            }
        } catch (error) {
            console.error('取消过期订单失败:', error)
            ElMessage.error('取消过期订单失败，请稍后重试')
        }
    }

    /**
     * 清除所有定时器
     */
    const clearAllTimers = () => {
        Object.keys(timers.value).forEach(key => {
            clearInterval(timers.value[key])
        })
        timers.value = {}
    }

    return {
        countdowns,
        startCountdowns,
        clearAllTimers
    }
}
