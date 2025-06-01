<script setup>
import { ElButton, ElDialog, ElEmpty, ElRadio } from 'element-plus'
import { ref, watch } from 'vue'

// 定义组件props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    addresses: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    defaultAddressId: {
        type: [String, Number],
        default: null
    }
})

// 定义事件
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 选中的地址
const selectedAddress = ref(null)

// 监听地址列表变化，设置默认选中地址
watch(
    () => props.addresses,
    (newAddresses) => {
        console.log('AddressDialog 监测到地址变化:', newAddresses)
        if (newAddresses && newAddresses.length > 0) {
            // 如果有默认地址ID，使用它
            if (props.defaultAddressId) {
                const defaultAddr = newAddresses.find(addr => addr.id === props.defaultAddressId)
                if (defaultAddr) {
                    selectedAddress.value = defaultAddr
                    return
                }
            }

            // 查找地址列表中的默认地址
            const defaultAddr = newAddresses.find(addr => addr.isDefault)
            if (defaultAddr) {
                selectedAddress.value = defaultAddr
            } else {
                // 如果没有默认地址，使用第一个地址
                selectedAddress.value = newAddresses[0]
            }
        } else {
            selectedAddress.value = null
        }
    },
    { immediate: true }
)

// 监听对话框可见性
watch(
    () => props.visible,
    (newVisible) => {
        console.log('AddressDialog 可见性变化:', newVisible)
    }
)

// 选择地址
const selectAddress = (address) => {
    selectedAddress.value = address
}

// 确认选择
const confirmSelection = () => {
    if (selectedAddress.value) {
        emit('confirm', selectedAddress.value)
    }
    closeDialog()
}

// 关闭对话框
const closeDialog = () => {
    emit('update:visible', false)
}
</script>

<template>
    <el-dialog :model-value="visible" title="选择收货地址" width="600px" @closed="$emit('cancel')" destroy-on-close>
        <div class="address-dialog-content" v-loading="loading">
            <el-empty v-if="addresses.length === 0" description="暂无收货地址" />
            <div v-else v-for="address in addresses" :key="address.id"
                :class="['address-dialog-item', { active: selectedAddress && selectedAddress.id === address.id }]"
                @click="selectAddress(address)">
                <div class="address-info">
                    <div class="contact">
                        <span class="name">{{ address.name }}</span>
                        <span class="phone">{{ address.phone }}</span>
                        <span v-if="address.isDefault" class="default-tag">默认</span>
                    </div>
                    <div class="detail">{{ address.address }}</div>
                </div>
                <div class="address-actions">
                    <el-radio v-model="selectedAddress.id" :label="address.id"
                        @change="selectAddress(address)">选择</el-radio>
                </div>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="confirmSelection">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.address-dialog-content {
    max-height: 400px;
    overflow-y: auto;
}

.address-dialog-item {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.address-dialog-item:hover {
    border-color: #409EFF;
}

.address-dialog-item.active {
    border-color: #409EFF;
    background-color: #ECF5FF;
}

.address-info {
    flex: 1;
}

.contact {
    margin-bottom: 5px;
}

.name {
    font-weight: bold;
    margin-right: 10px;
}

.phone {
    color: #606266;
}

.detail {
    color: #606266;
    font-size: 14px;
}

.default-tag {
    background-color: #409EFF;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 2px;
    margin-left: 10px;
}

.address-actions {
    display: flex;
    align-items: center;
}
</style>