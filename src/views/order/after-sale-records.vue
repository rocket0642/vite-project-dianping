<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useOrderStore } from '../../stores/order'

const route = useRoute()
const router = useRouter()
const afterSaleStore = useAfterSaleStore()
const orderStore = useOrderStore()

// 获取订单ID
const orderId = route.params.id
const loading = ref(false)
const orderDetail = ref(null)
const afterSaleRecords = ref([])

// 加载订单详情和售后记录
const loadData = async () => {
    try {
        loading.value = true

        // 加载订单详情
        const orderRes = await orderStore.fetchOrderDetail(orderId)
        if (orderRes) {
            orderDetail.value = orderRes
        } else {
            ElMessage.error('获取订单详情失败')
            router.push('/order/list')
            return
        }

        // 加载订单的售后记录
        const afterSaleRes = await afterSaleStore.fetchOrderAfterSales(orderId)
        if (afterSaleRes && Array.isArray(afterSaleRes)) {
            afterSaleRecords.value = afterSaleRes
        } else {
            afterSaleRecords.value = []
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败，请稍后重试')
        router.push('/order/list')
    } finally {
        loading.value = false
    }
}

// 格式化金额 (分 -> 元)
const formatPrice = (price) => {
    return (price / 100).toFixed(2)
}

// 获取售后状态文本
const getAfterSaleStatusText = (status) => {
    return afterSaleStore.getAfterSaleStatusText(status)
}

// 获取售后类型文本
const getAfterSaleTypeText = (type) => {
    return afterSaleStore.getAfterSaleTypeText(type)
}

// 查看售后详情
const viewAfterSaleDetail = (id) => {
    router.push(`/order/after-sale-detail/${id}`)
}

// 返回订单列表
const goBack = () => {
    router.go(-1)
}

// 组件挂载时加载数据
onMounted(() => {
    loadData()
})
</script>

<template>
    <AppLayout>
        <div class="after-sale-records-container" v-loading="loading">
            <div class="page-header">
                <h2 class="page-title">售后记录</h2>
                <el-button @click="goBack">返回</el-button>
            </div>

            <!-- 订单信息卡片 -->
            <div v-if="orderDetail" class="order-card">
                <div class="order-header">
                    <h3>订单信息</h3>
                    <span class="order-id">订单号：{{ orderDetail.id }}</span>
                </div>
                <div class="order-shop">
                    <span class="shop-name">{{ orderDetail.shopName }}</span>
                    <span class="order-time">下单时间：{{ orderDetail.createTime }}</span>
                </div>
                <div class="order-total">
                    <span>订单总金额：</span>
                    <span class="total-amount">¥{{ formatPrice(orderDetail.amount) }}</span>
                </div>
            </div>

            <!-- 售后记录列表 -->
            <div class="records-list">
                <h3>售后记录列表</h3>

                <div v-if="afterSaleRecords.length === 0" class="empty-records">
                    <el-empty description="暂无售后记录" />
                </div>

                <div v-else class="records-content">
                    <div v-for="record in afterSaleRecords" :key="record.id" class="record-item">
                        <div class="record-header">
                            <div class="record-info">
                                <span class="record-id">售后单号: {{ record.id }}</span>
                                <span :class="['record-status', `status-${record.status}`]">
                                    {{ getAfterSaleStatusText(record.status) }}
                                </span>
                            </div>
                            <span class="record-time">申请时间: {{ record.createTime }}</span>
                        </div>

                        <div class="record-body">
                            <div class="record-detail-item">
                                <span class="label">售后类型:</span>
                                <span>{{ getAfterSaleTypeText(record.type) }}</span>
                            </div>
                            <div class="record-detail-item">
                                <span class="label">申请原因:</span>
                                <span>{{ record.reason }}</span>
                            </div>
                            <div v-if="record.type === 1 || record.type === 2" class="record-detail-item">
                                <span class="label">退款金额:</span>
                                <span class="record-amount">¥{{ formatPrice(record.amount) }}</span>
                            </div>
                        </div>

                        <div class="record-footer">
                            <el-button type="primary" size="small" @click="viewAfterSaleDetail(record.id)">
                                查看详情
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
.after-sale-records-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 15px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
}

.order-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    margin-bottom: 15px;
}

.order-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
}

.order-id {
    color: #606266;
}

.order-shop {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
}

.shop-name {
    font-weight: 600;
    font-size: 16px;
}

.order-time {
    color: #909399;
}

.order-total {
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
}

.total-amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 18px;
    margin-left: 10px;
}

.records-list {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 20px;
}

.records-list h3 {
    margin-top: 0;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
    font-size: 18px;
}

.empty-records {
    padding: 30px 0;
}

.record-item {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    transition: all 0.2s;
}

.record-item:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ebeef5;
}

.record-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.record-id {
    font-weight: 500;
    color: #303133;
}

.record-status {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: white;
}

.status-1 {
    background-color: #e6a23c;
}

.status-2 {
    background-color: #67c23a;
}

.status-3 {
    background-color: #f56c6c;
}

.record-time {
    color: #909399;
    font-size: 14px;
}

.record-body {
    margin-bottom: 15px;
}

.record-detail-item {
    margin-bottom: 10px;
    display: flex;
}

.record-detail-item .label {
    width: 80px;
    color: #606266;
    font-weight: 500;
}

.record-amount {
    color: #f56c6c;
    font-weight: 500;
}

.record-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px dashed #ebeef5;
}

@media (max-width: 768px) {
    .after-sale-records-container {
        padding: 15px 10px;
    }

    .page-title {
        font-size: 18px;
    }

    .order-card,
    .records-list {
        padding: 15px;
    }

    .record-header {
        flex-direction: column;
    }

    .record-info {
        margin-bottom: 10px;
    }
}
</style>