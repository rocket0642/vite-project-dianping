<script setup>
import { ElInputNumber, ElRadio, ElRadioGroup } from 'element-plus'
import { computed, ref, watch } from 'vue'

// 定义props
const props = defineProps({
  // 商品SKU数据
  skus: {
    type: Array,
    required: true
  },
  // 默认选中的SKU ID
  defaultSelected: {
    type: Number,
    default: null
  }
})

// 定义事件
const emit = defineEmits(['update:selected', 'quantity-change'])

// 选中的SKU
const selectedSku = ref(null)

// 商品数量
const quantity = ref(1)

// 当前选中的SKU数据
const currentSku = computed(() => {
  if (!selectedSku.value) return null
  return props.skus.find(sku => sku.id === selectedSku.value)
})

// 最大可购买数量
const maxQuantity = computed(() => {
  if (!currentSku.value) return 1
  return currentSku.value.stock || 1
})

// 初始化选中的SKU
watch(() => props.skus, () => {
  // 如果有默认选中的SKU，则设置
  if (props.defaultSelected) {
    selectedSku.value = props.defaultSelected
  } else if (props.skus.length > 0) {
    // 否则默认选中第一个SKU
    selectedSku.value = props.skus[0].id
  }
  
  // 触发事件通知父组件
  emit('update:selected', selectedSku.value)
}, { immediate: true })

// SKU选择变更处理
const handleSkuChange = (skuId) => {
  selectedSku.value = skuId
  // 重置数量为1
  quantity.value = 1
  // 触发事件通知父组件
  emit('update:selected', skuId)
}

// 数量变更处理
const handleQuantityChange = (value) => {
  quantity.value = value
  // 触发事件通知父组件
  emit('quantity-change', value)
}
</script>

<template>
  <div class="sku-selector">
    <!-- SKU选择区 -->
    <div class="sku-options">
      <h4 class="sku-title">规格选择</h4>
      <el-radio-group v-model="selectedSku" @change="handleSkuChange">
        <el-radio 
          v-for="sku in skus" 
          :key="sku.id" 
          :label="sku.id"
          :disabled="sku.stock <= 0"
        >
          <span>{{ sku.name }}</span>
          <span class="sku-price">¥{{ (sku.price / 100).toFixed(2) }}</span>
          <span v-if="sku.stock <= 0" class="sku-sold-out">已售罄</span>
        </el-radio>
      </el-radio-group>
    </div>
    
    <!-- 数量选择区 -->
    <div class="quantity-selector">
      <h4 class="sku-title">数量</h4>
      <el-input-number 
        v-model="quantity" 
        :min="1" 
        :max="maxQuantity"
        @change="handleQuantityChange"
      />
      <span class="stock-info">库存: {{ currentSku ? currentSku.stock : 0 }}</span>
    </div>
  </div>
</template>

<style scoped>
.sku-selector {
  margin-bottom: 20px;
}

.sku-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.sku-options {
  margin-bottom: 20px;
}

.sku-price {
  margin-left: 10px;
  color: #f60;
  font-weight: bold;
}

.sku-sold-out {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}

.quantity-selector {
  display: flex;
  align-items: center;
}

.quantity-selector .sku-title {
  margin-right: 15px;
  margin-bottom: 0;
}

.stock-info {
  margin-left: 15px;
  color: #999;
  font-size: 14px;
}
</style>
