<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElRadioGroup, ElRadio, ElInput, ElButton } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useCartStore } from '../../stores/cart'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'

// 路由实例
const router = useRouter()

// 状态管理
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const orderForm = ref({
  address: '',
  payType: 1,
  remark: '',
  items: []
})

// 地址列表（模拟数据）
const addresses = ref([
  { id: 1, name: '张三', phone: '13800138000', address: '浙江省杭州市西湖区文三路 100 号' },
  { id: 2, name: '李四', phone: '13800138001', address: '浙江省杭州市滨江区江南大道 200 号' }
])

// 选中的地址
const selectedAddress = ref(addresses.value[0])

// 购物车选中商品
const checkedItems = computed(() => cartStore.checkedItems)

// 商品总金额
const totalAmount = computed(() => cartStore.totalPrice)

// 商品总数量
const totalCount = computed(() => cartStore.checkedCount)

// 格式化价格
const formatPrice = (price) => {
  return (price / 100).toFixed(2)
}

/**
 * 创建订单
 */
const createOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (checkedItems.value.length === 0) {
    ElMessage.warning('请选择要购买的商品')
    return
  }
  
  loading.value = true
  
  try {
    // 准备订单数据
    const orderData = {
      // 商品信息（假设接口只需要第一个商品信息和总金额）
      goodsId: checkedItems.value[0].id,
      goodsName: checkedItems.value[0].name,
      count: checkedItems.value.reduce((sum, item) => sum + item.count, 0),
      amount: totalAmount.value,
      // 收货信息
      addressId: selectedAddress.value.id,
      addressName: selectedAddress.value.name,
      addressPhone: selectedAddress.value.phone,
      addressDetail: selectedAddress.value.address,
      // 其他信息
      payType: orderForm.value.payType,
      remark: orderForm.value.remark
    }
    
    const orderId = await orderStore.createNewOrder(orderData)
    
    if (orderId) {
      ElMessage.success('订单创建成功')
      
      // 清除购物车中已购买的商品
      cartStore.removeCheckedItems()
      
      // 跳转到支付页面
      router.push(`/order/pay/${orderId}`)
    } else {
      ElMessage.error('订单创建失败')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('订单创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 返回购物车
 */
const goBack = () => {
  router.push('/cart')
}

// 初始化
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/create')
    return
  }
  
  if (checkedItems.value.length === 0) {
    ElMessage.warning('请先选择要购买的商品')
    router.push('/cart')
  }
})
</script>

<template>
  <AppLayout>
    <div class="order-create-container">
      <div class="page-header">
        <h1>创建订单</h1>
      </div>
      
      <!-- 收货地址 -->
      <div class="section address-section">
        <h2 class="section-title">收货地址</h2>
        <div class="address-list">
          <div 
            v-for="address in addresses" 
            :key="address.id" 
            :class="['address-item', { active: selectedAddress.id === address.id }]"
            @click="selectedAddress = address"
          >
            <div class="address-info">
              <div class="contact">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <div class="detail">{{ address.address }}</div>
            </div>
            <div class="address-actions">
              <el-radio v-model="selectedAddress.id" :label="address.id">选择</el-radio>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单商品 -->
      <div class="section goods-section">
        <h2 class="section-title">商品信息</h2>
        <div class="goods-list">
          <div 
            v-for="item in checkedItems" 
            :key="`${item.id}-${item.skuId || 0}`"
            class="goods-item"
          >
            <div class="goods-image">
              <img :src="item.imageUrl" :alt="item.name">
            </div>
            <div class="goods-info">
              <div class="goods-name">{{ item.name }}</div>
              <div v-if="item.skuName" class="goods-sku">{{ item.skuName }}</div>
              <div class="goods-price">¥{{ formatPrice(item.price) }}</div>
            </div>
            <div class="goods-count">
              x{{ item.count }}
            </div>
            <div class="goods-subtotal">
              ¥{{ formatPrice(item.price * item.count) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 支付方式 -->
      <div class="section payment-section">
        <h2 class="section-title">支付方式</h2>
        <el-radio-group v-model="orderForm.payType">
          <el-radio :label="1">微信支付</el-radio>
          <el-radio :label="2">支付宝</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 订单备注 -->
      <div class="section remark-section">
        <h2 class="section-title">订单备注</h2>
        <el-input 
          v-model="orderForm.remark"
          type="textarea"
          placeholder="请输入订单备注信息"
          :rows="3"
          maxlength="200"
          show-word-limit
        ></el-input>
      </div>
      
      <!-- 订单总结 -->
      <div class="section summary-section">
        <div class="summary-row">
          <span>商品总数：</span>
          <span>{{ totalCount }}件</span>
        </div>
        <div class="summary-row">
          <span>订单总额：</span>
          <span class="total-price">¥{{ formatPrice(totalAmount) }}</span>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="order-footer">
        <el-button @click="goBack">返回购物车</el-button>
        <el-button 
          type="primary" 
          :loading="loading" 
          @click="createOrder"
        >
          提交订单
        </el-button>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-create-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 22px;
  color: #333;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #409EFF;
  border-radius: 2px;
}

/* 地址样式 */
.address-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.address-item {
  width: calc(50% - 10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #c0c4cc;
}

.address-item.active {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.contact {
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.phone {
  color: #666;
}

.detail {
  color: #666;
  line-height: 1.4;
}

/* 商品样式 */
.goods-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 16px;
  margin-bottom: 6px;
}

.goods-sku {
  font-size: 14px;
  color: #999;
  margin-bottom: 6px;
}

.goods-price {
  font-size: 16px;
  color: #f60;
}

.goods-count {
  margin: 0 20px;
  color: #666;
}

.goods-subtotal {
  font-size: 16px;
  font-weight: bold;
  color: #f60;
  width: 100px;
  text-align: right;
}

/* 支付方式样式 */
.payment-section .el-radio-group {
  display: flex;
  gap: 20px;
}

/* 订单总结样式 */
.summary-section {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f60;
}

/* 底部按钮样式 */
.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-item {
    width: 100%;
  }
  
  .goods-item {
    flex-wrap: wrap;
  }
  
  .goods-info {
    width: calc(100% - 100px);
  }
  
  .goods-count, .goods-subtotal {
    margin-top: 10px;
  }
  
  .goods-subtotal {
    text-align: left;
  }
  
  .payment-section .el-radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-footer {
    flex-direction: column;
  }
  
  .order-footer .el-button {
    width: 100%;
  }
}
</style>
