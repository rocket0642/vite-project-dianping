import { ElMessage } from 'element-plus'

export function useOrderOperations(router, orderStore, afterSaleStore, loadOrders) {
    /**
     * 查看订单详情
     */
    const viewOrderDetail = (orderId) => {
        router.push(`/order/detail/${orderId}`)
    }

    /**
     * 去支付
     */
    const goToPay = (orderId) => {
        if (!orderId) {
            ElMessage.error('订单ID无效')
            return
        }
        router.push(`/order/pay/${orderId}`)
    }

    /**
     * 取消订单
     */
    const cancelOrder = async (orderId) => {
        try {
            const res = await orderStore.cancelUserOrder({
                orderId,
                cancelReason: `用户取消`
            })
            if (res.success) {
                ElMessage.success('订单已取消')
                await loadOrders()
            } else {
                ElMessage.error(res.errorMsg || '取消订单失败')
            }
        } catch (error) {
            console.error('取消订单失败:', error)
            ElMessage.error('取消订单失败，请稍后重试')
        }
    }

    /**
     * 确认收货
     */
    const confirmOrder = async (orderId) => {
        try {
            const res = await orderStore.deliveryUserOrder(orderId)
            if (res.success) {
                ElMessage.success('已确认收货')
                await loadOrders()
            } else {
                ElMessage.error(res.errorMsg || '确认收货失败')
            }
        } catch (error) {
            console.error('确认收货失败:', error)
            ElMessage.error('确认收货失败，请稍后重试')
        }
    }

    /**
     * 再次购买
     */
    const buyAgain = (order) => {
        router.push(`/shop/${order.shopId}`)
    }

    /**
     * 去评价
     */
    const goToComment = (orderId) => {
        router.push(`/order/comment/${orderId}`)
    }

    /**
     * 申请售后
     */
    const applyAfterSale = (orderId) => {
        router.push(`/order/after-sale/${orderId}`)
    }

    /**
     * 查看物流
     */
    const viewLogistics = (orderId) => {
        router.push(`/order/logistics/${orderId}`)
    }

    /**
     * 查看售后详情
     */
    const viewAfterSaleDetail = async (orderId) => {
        try {
            const afterSales = await afterSaleStore.fetchOrderAfterSales(orderId)
            if (afterSales && afterSales.length > 0) {
                router.push(`/order/after-sale-detail/${afterSales[0].id}`)
            } else {
                ElMessage.info('该订单暂无售后记录，请先申请售后')
                router.push(`/order/after-sale/${orderId}`)
            }
        } catch (error) {
            console.error('查询售后记录失败:', error)
            ElMessage.error('查询售后记录失败，请稍后重试')
        }
    }

    /**
     * 跳转到商品详情
     */
    const goToGoodsDetail = (goodsId) => {
        router.push(`/product/${goodsId}`)
    }

    /**
     * 跳转到店铺详情
     */
    const goToShopDetail = (shopId) => {
        router.push(`/shop/${shopId}`)
    }

    return {
        viewOrderDetail,
        goToPay,
        cancelOrder,
        confirmOrder,
        buyAgain,
        goToComment,
        applyAfterSale,
        viewLogistics,
        viewAfterSaleDetail,
        goToGoodsDetail,
        goToShopDetail
    }
}
