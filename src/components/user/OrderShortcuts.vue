<script setup>
import { Box, ChatDotRound, Document, Money, Van } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 跳转到订单列表
 * @param {number} status - 订单状态
 */
const goToOrderList = (status) => {
    router.push(`/order/list?status=${status}&fromUserCenter=true`)
}
</script>

<template>
    <div class="section-card">
        <h3 class="section-title">我的订单</h3>
        <div class="order-shortcuts">
            <div class="shortcut-item" @click="goToOrderList(0)">
                <el-icon>
                    <Document />
                </el-icon>
                <span class="shortcut-label">全部订单</span>
            </div>
            <div class="shortcut-item" @click="goToOrderList(2)">
                <el-icon>
                    <Box />
                </el-icon>
                <span class="shortcut-label">已支付</span>
            </div>
            <div class="shortcut-item" @click="goToOrderList(1)">
                <el-icon>
                    <Money />
                </el-icon>
                <span class="shortcut-label">待付款</span>
            </div>
            <div class="shortcut-item" @click="goToOrderList(3)">
                <el-icon>
                    <Document />
                </el-icon>
                <span class="shortcut-label">已取消</span>
            </div>
            <div class="shortcut-item" @click="goToOrderList(4)">
                <el-icon>
                    <Van />
                </el-icon>
                <span class="shortcut-label">待收货</span>
            </div>
            <div class="shortcut-item" @click="goToOrderList(5)">
                <el-icon>
                    <ChatDotRound />
                </el-icon>
                <span class="shortcut-label">待评价</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.section-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 15px 0;
    color: #303133;
}

.order-shortcuts {
    display: flex;
    justify-content: space-between;
}

.shortcut-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    cursor: pointer;
    padding: 15px 0;
    flex: 1;
}

.shortcut-item:hover {
    background-color: #f5f7fa;
    border-radius: 4px;
}

.shortcut-label {
    margin-top: 8px;
    font-size: 14px;
}
</style>