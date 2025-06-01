<script setup>
import { Location } from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElSkeleton, ElSkeletonItem, ElTag } from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '../../stores/address'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 3
    }
})

const router = useRouter()
const addressStore = useAddressStore()

// 限制显示的地址数量
const addresses = computed(() =>
    addressStore.addressList ? addressStore.addressList.slice(0, props.limit) : []
)

/**
 * 跳转到地址管理页面
 */
const goToAddressManage = () => {
    router.push('/user/address')
}
</script>

<template>
    <div class="section-card">
        <div class="section-header">
            <h3 class="section-title">我的地址</h3>
            <el-button type="text" @click="goToAddressManage">管理</el-button>
        </div>

        <el-skeleton :loading="loading" animated :count="3">
            <template #template>
                <div class="skeleton-address">
                    <el-skeleton-item variant="text" style="width: 90%; height: 20px; margin-bottom: 8px;" />
                    <el-skeleton-item variant="text" style="width: 60%; height: 16px;" />
                </div>
            </template>

            <template #default>
                <div v-if="addresses.length > 0" class="address-list">
                    <div v-for="address in addresses" :key="address.id" class="address-item">
                        <div class="address-info">
                            <div class="address-header">
                                <span class="address-name">{{ address.name }}</span>
                                <span class="address-phone">{{ address.phone }}</span>
                                <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                            </div>
                            <div class="address-detail">{{ address.address }}</div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-address">
                    <el-icon>
                        <Location />
                    </el-icon>
                    <p>您还没有添加收货地址</p>
                    <el-button type="primary" size="small" @click="goToAddressManage">添加地址</el-button>
                </div>
            </template>
        </el-skeleton>
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

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #303133;
}

.address-list {
    margin-top: 10px;
}

.skeleton-address {
    padding: 15px 0;
    border-bottom: 1px solid #ebeef5;
}

.address-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #ebeef5;
}

.address-item:last-child {
    border-bottom: none;
}

.address-header {
    margin-bottom: 8px;
}

.address-name {
    font-weight: 600;
    margin-right: 10px;
}

.address-phone {
    color: #606266;
}

.address-detail {
    color: #606266;
    font-size: 14px;
}

.empty-address {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: #909399;
}

.empty-address p {
    margin: 10px 0;
}
</style>