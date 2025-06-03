import { ElMessage, ElMessageBox } from 'element-plus'

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
            const result = await ElMessageBox.confirm(
                '确认取消该订单?',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )

            if (result === 'confirm') {
                const res = await orderStore.cancelUserOrder({
                    orderId: orderId,
                    cancelReason: '用户取消'
                })

                if (res.success) {
                    ElMessage.success('订单已取消')
                    await loadOrders()
                } else {
                    ElMessage.error(res.errorMsg || '取消订单失败')
                }
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
            const result = await ElMessageBox.confirm(
                '确认您已收到商品?',
                '提示',
                {
                    confirmButtonText: '确认收货',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )

            if (result === 'confirm') {
                const res = await orderStore.deliveryUserOrder(orderId)
                if (res.success) {
                    ElMessage.success('已确认收货')
                    await loadOrders()
                } else {
                    ElMessage.error(res.errorMsg || '确认收货失败')
                }
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
                const latestAfterSale = afterSales[0]
                router.push(`/order/after-sale-detail/${latestAfterSale.id}`)
            } else {
                ElMessageBox.alert('没有找到相关售后记录', '提示', {
                    confirmButtonText: '确定'
                })
            }
        } catch (error) {
            console.error('查看售后详情失败:', error)
        }
    }

    /**
     * 查看售后记录列表
     */
    const viewAfterSaleRecords = (orderId) => {
        router.push(`/order/after-sale-records/${orderId}`)
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
        viewAfterSaleRecords,
        goToGoodsDetail,
        goToShopDetail
    }
}
