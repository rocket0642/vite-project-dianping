<script setup>

// 定义组件props
const props = defineProps({
    activeTab: {
        type: String,
        required: true
    }
})

// 定义事件
const emit = defineEmits(['tabChange'])

// 切换标签
const handleTabChange = (tab) => {
    emit('tabChange', tab)
}
</script>

<template>
    <div class="order-tabs">
        <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="handleTabChange('all')">
            全部订单
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'paid' }" @click="handleTabChange('paid')">
            已支付
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'unpaid' }" @click="handleTabChange('unpaid')">
            待付款
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'canceled' }" @click="handleTabChange('canceled')">
            已取消
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'unreceived' }" @click="handleTabChange('unreceived')">
            待收货
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'uncommented' }" @click="handleTabChange('uncommented')">
            待评价
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'afterSale' }" @click="handleTabChange('afterSale')">
            售后服务
        </div>
    </div>
</template>

<style scoped>
.order-tabs {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
    flex-shrink: 0;
}

.tab-item {
    padding: 10px 20px;
    cursor: pointer;
    position: relative;
}

.tab-item.active {
    color: #409eff;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #409eff;
}
</style>