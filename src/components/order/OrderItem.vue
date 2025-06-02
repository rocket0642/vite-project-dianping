<script setup>

// 定义props
const props = defineProps({
    order: {
        type: Object,
        required: true
    },
    countdown: {
        type: String,
        default: '20:00'
    }
})

// 定义事件
const emit = defineEmits([
    'viewDetail',
    'goToPay',
    'buyAgain',
    'cancelOrder',
    'confirmOrder',
    'viewLogistics',
    'goToComment',
    'applyRefund',
    'viewAfterSaleDetail',
    'applyAfterSale',
    'goToShopDetail',
    'goToGoodsDetail',
    'openAddressDialog'
])

// 格式化价格
const formatPrice = (price) => {
    return (price / 100).toFixed(2)
}

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 1: return '待付款'
        case 2: return '已支付'
        case 3: return '已取消'
        case 4: return '待收货'
        case 5: return '已完成'
        case 6: return '售后处理中'
        default: return '未知状态'
    }
}

// 获取默认图片
const getDefaultImage = (type) => {
    if (type === 'shop') {
        return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    } else if (type === 'goods') {
        return 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
    }
    return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
}

// 事件代理方法
const handleViewDetail = () => emit('viewDetail', props.order.id)
const handleGoToPay = () => emit('goToPay', props.order.id)
const handleCancelOrder = () => emit('cancelOrder', props.order.id)
const handleBuyAgain = () => emit('buyAgain', props.order)
const handleConfirmOrder = () => emit('confirmOrder', props.order.id)
const handleViewLogistics = () => emit('viewLogistics', props.order.id)
const handleGoToComment = () => emit('goToComment', props.order.id)
const handleApplyRefund = () => emit('applyRefund', props.order.id)
const handleApplyAfterSale = () => emit('applyAfterSale', props.order.id)
const handleViewAfterSaleDetail = () => emit('viewAfterSaleDetail', props.order.id)
const handleGoToShopDetail = () => emit('goToShopDetail', props.order.shopId)
const handleOpenAddressDialog = () => emit('openAddressDialog', props.order.id)
const handleGoToGoodsDetail = (goodsId) => emit('goToGoodsDetail', goodsId)
</script>

<template>
    <div class="order-item">
        <div class="order-header">
            <div class="shop-info-header" @click="handleGoToShopDetail">
                <div class="shop-avatar">
                    <img :src="order.shopImage || getDefaultImage('shop')" alt="店铺图片" />
                </div>
                <div class="order-basic-info">
                    <span class="shop-name">{{ order.shopName }}</span>
                    <div class="order-meta">
                        <span class="order-id">订单号: {{ order.id }}</span>
                        <span class="order-time">下单时间: {{ order.createTime }}</span>
                    </div>
                </div>
            </div>
            <div class="order-status">
                <span :class="['status-tag', `status-${order.status}`]">
                    {{ getStatusText(order.status) }}
                </span>
                <span v-if="order.status === 1" class="countdown-tag">
                    剩余: {{ countdown || '30:00' }}
                </span>
            </div>
        </div>

        <div class="order-content">
            <!-- 如果有items数组，则遍历显示所有商品 -->
            <div v-if="order.items && order.items.length" class="order-products">
                <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="order-product">
                    <div class="product-image" @click="handleGoToGoodsDetail(item.goodsId)">
                        <img :src="item.goodsImage?.[0] || getDefaultImage('goods')" alt="商品图片" />
                    </div>
                    <div class="product-info">
                        <div class="product-name" @click="handleGoToGoodsDetail(item.goodsId)">
                            {{ item.goodsName }}
                        </div>
                        <div class="product-skuName">
                            {{ item.skuName }}
                        </div>
                        <div class="product-quantity">x{{ item.count }}</div>
                    </div>
                    <div class="product-price">¥{{ formatPrice(item.price * item.count) }}</div>
                </div>
            </div>

            <!-- 显示收货地址信息 -->
            <div v-if="order.status === 1" class="order-address">
                <div class="address-header">
                    <span class="address-title">收货信息：</span>
                    <span v-if="order.addressName" class="address-info">
                        {{ order.addressName }} {{ order.addressPhone }} {{ order.addressDetail }}
                    </span>
                    <span v-else class="address-empty">暂无收货地址</span>
                </div>
            </div>
        </div>

        <div class="order-footer">
            <div class="order-total">
                共{{ order.count }}件商品，总计：<span class="price">¥{{ formatPrice(order.amount) }}</span>
            </div>

            <div class="order-actions">
                <!-- 待付款订单 -->
                <template v-if="order.status === 1">
                    <button class="action-btn primary" @click="handleGoToPay">去支付</button>
                    <button class="action-btn secondary" @click="handleOpenAddressDialog">修改地址</button>
                    <button class="action-btn default" @click="handleCancelOrder">取消订单</button>
                    <button class="action-btn info" @click="handleViewDetail">查看详情</button>
                </template>

                <!-- 已支付订单 -->
                <template v-else-if="order.status === 2">
                    <button class="action-btn info" @click="handleViewDetail">查看详情</button>
                </template>

                <!-- 已取消订单 -->
                <template v-else-if="order.status === 3">
                    <button class="action-btn primary" @click="handleBuyAgain">再次购买</button>
                    <button class="action-btn info" @click="handleViewDetail">查看详情</button>
                </template>

                <!-- 待收货订单 -->
                <template v-else-if="order.status === 4">
                    <button class="action-btn primary" @click="handleConfirmOrder">确认收货</button>
                    <button class="action-btn default" @click="handleViewLogistics">查看物流</button>
                    <button class="action-btn warning" @click="handleApplyAfterSale">申请售后</button>
                    <button class="action-btn info" @click="handleViewDetail">查看详情</button>
                </template>

                <!-- 已完成订单 -->
                <template v-else-if="order.status === 5">
                    <button v-if="!order.commented" class="action-btn primary" @click="handleGoToComment">去评价</button>
                    <button v-else class="action-btn disabled" disabled>已评价</button>
                    <button class="action-btn warning" @click="handleApplyAfterSale">申请售后</button>
                    <button class="action-btn primary" @click="handleBuyAgain">再次购买</button>
                    <button class="action-btn info" @click="handleViewDetail">查看详情</button>
                </template>

                <!-- 售后服务状态 -->
                <template v-else-if="order.status === 6">
                    <button class="action-btn warning" @click="handleViewAfterSaleDetail">查看售后详情</button>
                    <button class="action-btn info" @click="handleViewDetail">查看订单详情</button>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.order-item {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 20px;
    background-color: #fff;
    transition: transform 0.2s, box-shadow 0.2s;
}

.order-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #f8f8f8;
    border-bottom: 1px solid #ebeef5;
}

.shop-info-header {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.shop-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 15px;
    border: 1px solid #ebeef5;
}

.shop-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.shop-name {
    font-weight: bold;
    color: #333;
    font-size: 16px;
    margin-bottom: 5px;
    display: block;
}

.shop-name:hover {
    color: #409eff;
}

.order-meta {
    display: flex;
    gap: 15px;
}

.order-id,
.order-time {
    color: #606266;
    font-size: 14px;
}

.order-status {
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-tag {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 13px;
    color: white;
}

.status-1 {
    background-color: #e6a23c;
}

.status-2 {
    background-color: #409eff;
}

.status-3 {
    background-color: #909399;
}

.status-4 {
    background-color: #67c23a;
}

.status-5 {
    background-color: #e6a23c;
}

.status-6 {
    background-color: #E6A23C;
}

.countdown-tag {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
    margin-left: 10px;
}

.order-content {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
}

.order-products {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.order-product {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;
}

.order-product:last-child {
    border-bottom: none;
}

.product-image {
    width: 70px;
    height: 70px;
    margin-right: 15px;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #eee;
    cursor: pointer;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    margin-bottom: 8px;
    cursor: pointer;
    color: #303133;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-name:hover {
    color: #409eff;
    text-decoration: underline;
}

.product-quantity {
    color: #606266;
}

.product-price {
    color: #f56c6c;
    font-weight: bold;
    width: 120px;
    text-align: right;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}

.order-total {
    color: #606266;
}

.price {
    color: #F56C6C;
    font-weight: bold;
    font-size: 16px;
}

.order-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    color: white;
}

.action-btn.primary {
    background-color: #409eff;
}

.action-btn.primary:hover {
    background-color: #66b1ff;
}

.action-btn.secondary {
    background-color: #67c23a;
}

.action-btn.secondary:hover {
    background-color: #85ce61;
}

.action-btn.default {
    background-color: #f56c6c;
}

.action-btn.default:hover {
    background-color: #f78989;
}

.action-btn.warning {
    background-color: #E6A23C;
}

.action-btn.warning:hover {
    background-color: #ebb563;
}

.action-btn.info {
    background-color: #909399;
}

.action-btn.info:hover {
    background-color: #a6a9ad;
}

.action-btn.disabled {
    background-color: #c0c4cc;
    cursor: not-allowed;
    opacity: 0.7;
}

.action-btn.disabled:hover {
    background-color: #c0c4cc;
}

.order-address {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ebeef5;
}

.address-header {
    display: flex;
    align-items: baseline;
}

.address-title {
    font-weight: bold;
    margin-right: 10px;
    color: #606266;
}

.address-info {
    color: #303133;
}

.address-empty {
    color: #909399;
    font-style: italic;
}

.product-skuName {
    color: #909399;
    font-size: 13px;
    margin-bottom: 5px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .order-header {
        flex-direction: column;
    }

    .shop-info-header {
        margin-bottom: 10px;
    }

    .order-status {
        align-self: flex-end;
    }

    .order-actions {
        flex-wrap: wrap;
    }

    .product-name {
        max-width: 150px;
    }
}
</style>