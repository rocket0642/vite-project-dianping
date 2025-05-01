<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElRadioGroup, ElRadio, ElInput, ElButton, ElDivider } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useCartStore } from '../../stores/cart'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '../../stores/user'
import { getUserAddresses } from '../../api/address'
import { Check, Plus } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 状态管理
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const addressesLoading = ref(false)
const orderForm = ref({
  address: '',
  payType: 1,
  remark: '',
  items: []
})

// 地址列表
const addresses = ref([])

// 选中的地址
const selectedAddress = ref(null)

// 按店铺分组的购物车选中商品
const groupedCheckedItems = computed(() => {
  const items = cartStore.checkedItems
  const groups = {}
  
  items.forEach(item => {
    if (!groups[item.shopId]) {
      groups[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName || `店铺${item.shopId}`,
        items: [],
        totalAmount: 0
      }
    }
    
    groups[item.shopId].items.push(item)
    groups[item.shopId].totalAmount += item.price * item.count
  })
  
  return Object.values(groups)
})

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
  
  if (groupedCheckedItems.value.length === 0) {
    ElMessage.warning('请选择要购买的商品')
    return
  }
  
  loading.value = true
  
  try {
    const orderIds = []
    
    // 按照店铺分别创建订单
    for (const group of groupedCheckedItems.value) {
      // 准备订单数据
      const orderData = {
        // 店铺信息
        shopId: group.shopId,
        shopName: group.shopName,
        // 商品信息列表
        items: group.items.map(item => ({
          goodsId: item.id,
          goodsName: item.name,
          count: item.count,
          price: item.price,
          skuId: item.skuId || null,
          skuName: item.skuName || null,
        })),
        // 订单总金额
        amount: group.totalAmount,
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
        orderIds.push(orderId)
      }
    }
    
    if (orderIds.length > 0) {
      ElMessage.success(`成功创建${orderIds.length}个订单`)
      
      // 清除购物车中已购买的商品
      cartStore.removeCheckedItems()
      
      // 如果只有一个订单，直接跳转到支付页面
      if (orderIds.length === 1) {
        router.push(`/order/pay/${orderIds[0]}`)
      } else {
        // 如果有多个订单，跳转到订单列表页面
        router.push('/order/list')
      }
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

/**
 * 加载用户地址列表
 */
const loadAddresses = async () => {
  addressesLoading.value = true
  try {
    const res = await getUserAddresses()
    addresses.value = res
    
    // 如果有默认地址，选择默认地址
    if (addresses.value.length > 0) {
      const defaultAddress = addresses.value.find(addr => addr.isDefault)
      selectedAddress.value = defaultAddress || addresses.value[0]
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    addressesLoading.value = false
  }
}

/**
 * 选择地址
 */
const selectAddress = (address) => {
  selectedAddress.value = address
}

/**
 * 跳转到地址管理页面
 */
const goToAddressManage = () => {
  router.push('/user/address')
}

// 初始化
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login?redirect=/order/create')
    return
  }
  
  if (cartStore.checkedCount === 0) {
    ElMessage.warning('请先选择要购买的商品')
    router.push('/cart')
    return
  }
  
  // 加载地址列表
  loadAddresses()
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
        <div class="section-header">
          <h2 class="section-title">收货地址</h2>
          <el-button type="primary" size="small" @click="goToAddressManage">
            <el-icon><Plus /></el-icon>
            管理地址
          </el-button>
        </div>
        
        <div v-loading="addressesLoading" class="address-content">
          <div v-if="addresses.length === 0 && !addressesLoading" class="empty-address">
            <p>您还没有添加收货地址</p>
            <el-button type="primary" size="small" @click="goToAddressManage">添加地址</el-button>
          </div>
          
          <div v-else class="address-list">
            <div
              v-for="address in addresses"
              :key="address.id"
              class="address-item"
              :class="{ 'active': selectedAddress && selectedAddress.id === address.id }"
              @click="selectAddress(address)"
            >
              <div class="address-info">
                <div class="address-header">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
                </div>
                <div class="address-detail">{{ address.address }}</div>
              </div>
              <div class="address-check" v-if="selectedAddress && selectedAddress.id === address.id">
                <el-icon color="#409EFF"><Check /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单商品（按店铺分组） -->
      <div class="section goods-section">
        <h2 class="section-title">商品信息</h2>
        
        <div v-for="group in groupedCheckedItems" :key="group.shopId" class="shop-group">
          <div class="shop-header">
            <h3 class="shop-name">{{ group.shopName }}</h3>
            <div class="shop-total">
              小计：<span class="price">¥{{ formatPrice(group.totalAmount) }}</span>
            </div>
          </div>
          
          <div class="goods-list">
            <div 
              v-for="item in group.items" 
              :key="`${item.id}-${item.skuId || 0}`"
              class="goods-item"
            >
              <div class="goods-image">
                <img :src="item.imageUrl" :alt="item.name">
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.name }}</div>
                <div v-if="item.skuName" class="goods-sku">规格：{{ item.skuName }}</div>
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
          
          <el-divider v-if="groupedCheckedItems.indexOf(group) < groupedCheckedItems.length - 1" />
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
        <div class="summary-row">
          <span>生成订单数：</span>
          <span>{{ groupedCheckedItems.length }}个</span>
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 0;
  color: #333;
}

.address-content {
  min-height: 100px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.address-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.address-item.active {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.address-header {
  margin-bottom: 8px;
}

.address-name {
  font-weight: bold;
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
  text-align: center;
  padding: 20px;
  color: #909399;
}

.contact {
  margin-bottom: 10px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.detail {
  color: #666;
}

.shop-group {
  margin-bottom: 20px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shop-name {
  font-size: 16px;
  font-weight: bold;
}

.shop-total {
  font-size: 16px;
}

.goods-list {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
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
  width: 60px;
  height: 60px;
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
  font-weight: bold;
  margin-bottom: 5px;
}

.goods-sku {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.goods-price {
  color: #f60;
}

.goods-count {
  margin: 0 20px;
}

.goods-subtotal {
  font-weight: bold;
  color: #f60;
  width: 100px;
  text-align: right;
}

.payment-section {
  margin-top: 30px;
}

.summary-section {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row:last-child {
  margin-bottom: 0;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #f60;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }
  
  .goods-item {
    flex-wrap: wrap;
  }
  
  .goods-info {
    width: calc(100% - 75px);
    margin-bottom: 10px;
  }
  
  .goods-count, .goods-subtotal {
    margin-left: 75px;
  }
}
</style>
