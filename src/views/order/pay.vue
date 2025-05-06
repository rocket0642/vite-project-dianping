<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElDialog, ElButton, ElRadio, ElEmpty } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useAddressStore } from '../../stores/address'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()
const addressStore = useAddressStore()
// 状态
const loading = ref(true)
const paying = ref(false)
const order = ref({})
const orderId = parseInt(route.params.id)
const payType = ref(1) // 默认微信支付
const countdown = ref(1800) // 默认30分钟倒计时（秒）
const timer = ref(null)

// 地址相关
const addressDialogVisible = ref(false)
const addresses = ref([])
const addressesLoading = ref(false)
const selectedAddress = ref(null)

// 计算属性
const formatAmount = computed(() => {
  return order.value.amount ? (order.value.amount / 100).toFixed(2) : '0.00'
})

const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * 加载订单数据
 */
const loadOrder = async () => {
  loading.value = true
  try {
    const result = await orderStore.fetchOrderDetail(orderId)

    if (!result) {
      ElMessage.error('订单不存在')
      router.replace('/order/list')
      return
    }

    order.value = orderStore.currentOrder

    // 如果订单已支付或已取消，跳转到订单详情页
    if (order.value.status !== 1) {
      ElMessage.info('该订单已不在待支付状态')
      router.replace(`/order/detail/${orderId}`)
      return
    }

    // 初始化地址
    initAddress()

    // 初始化倒计时
    initCountdown()

  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('订单加载失败')
    router.replace('/order/list')
  } finally {
    loading.value = false
  }
}

/**
 * 初始化倒计时
 */
const initCountdown = () => {
  if (!order.value || !order.value.createTime) {
    countdown.value = 1800; // 默认30分钟
    startCountdown();
    return;
  }

  try {
    // 从订单创建时间计算剩余时间
    const createTime = new Date(order.value.createTime).getTime();
    const expireTime = createTime + 20 * 60 * 1000; // 30分钟后过期
    const now = Date.now();

    // 计算剩余秒数
    const remainingTime = Math.max(0, Math.floor((expireTime - now) / 1000));

    if (remainingTime <= 0) {
      // 订单已超时，自动取消
      handleExpiredOrder();
      return;
    }

    countdown.value = remainingTime;
    startCountdown();
  } catch (error) {
    console.error('计算倒计时出错:', error);
    countdown.value = 1800; // 出错时设置默认30分钟
    startCountdown();
  }
}

/**
 * 启动倒计时
 */
const startCountdown = () => {
  clearInterval(timer.value)

  timer.value = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      clearInterval(timer.value)
      handleExpiredOrder()
    }
  }, 1000)
}

/**
 * 处理超时订单
 */
const handleExpiredOrder = async () => {
  try {
    // 如果订单状态不是3（已取消），则先调用取消接口
    if (order.value && order.value.status !== 3) {
      const res = await orderStore.cancelUserOrder({
        orderId,
        cancelReason: `超时自动取消`
      })
      if (!res.success) {
        ElMessage.error(res.errorMsg || '订单取消失败')
      }
    }
    
    // 清除倒计时
    clearInterval(timer.value)
    
    // 显示提示框
    ElMessageBox.alert(
      '订单已超时自动取消',
      '支付超时',
      {
        confirmButtonText: '返回订单列表',
        callback: () => {
          router.push('/order/list')
        }
      }
    )
  } catch (error) {
    console.error('处理超时订单失败:', error)
    ElMessage.error('处理超时订单失败，请稍后重试')
  }
}

/**
 * 支付订单
 */
const payOrder = async () => {
  if (paying.value) return

  paying.value = true
  try {
    const res = await orderStore.payUserOrder(orderId, payType.value)

    if (res && res.success) {
      ElMessage.success('支付成功')
      // 清除倒计时
      clearInterval(timer.value)

      // 添加通知 - 5秒后系统将自动发货
      ElMessage.info('系统将在5秒后自动发货')

      // 延时5秒后跳转到订单详情页
      setTimeout(async () => {
        // 发货
        const res = await orderStore.confirmUserOrder(orderId)
        if (res.success) {
          // 跳转到订单详情页
          router.push(`/order/detail/${orderId}`)
        } else {
          ElMessage.error(res?.errorMsg || '发货失败，请稍后重试')
        }
      }, 5000)
    } else {
      ElMessage.error(res?.errorMsg || '支付失败，请稍后重试')
    }
  } catch (error) {
    console.error('支付订单失败:', error)
    ElMessage.error('支付失败，请稍后重试')
  } finally {
    paying.value = false
  }
}

/**
 * 取消订单
 */
const cancelOrder = async () => {
  try {
    ElMessageBox.confirm(
      '确定要取消订单吗？',
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning'
      }
    ).then(async () => {
      const res = await orderStore.cancelUserOrder({
        orderId,
        cancelReason: `用户取消`
      })
      if (res.success) {
        ElMessage.success('订单已取消')
        // 清除倒计时
        clearInterval(timer.value)
        router.push('/order/list')
      } else {
        ElMessage.error(res.errorMsg || '取消订单失败')
      }
    }).catch(() => {
      // 用户取消操作
    })
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败，请稍后重试')
  }
}

/**
 * 跳转到订单列表（暂不支付）
 */
const skipPayment = () => {
  ElMessageBox.confirm(
    '订单将保留在您的订单列表中，超时未支付将自动取消',
    '暂不支付',
    {
      confirmButtonText: '确定',
      cancelButtonText: '返回',
      type: 'info'
    }
  ).then(() => {
    router.push('/order/list')
  }).catch(() => {
    // 用户取消操作
  })
}

/**
 * 选择支付方式
 */
const selectPayType = (type) => {
  payType.value = type
}

/**
 * 初始化地址信息
 */
const initAddress = () => {
  // 如果订单已有地址信息，则使用订单地址
  if (order.value.addressName && order.value.addressPhone && order.value.addressDetail) {
    selectedAddress.value = {
      id: order.value.addressId || 0,
      name: order.value.addressName,
      phone: order.value.addressPhone,
      address: order.value.addressDetail
    }
  }

  // 加载用户地址列表
  loadUserAddresses()
}

/**
 * 加载用户地址列表
 */
const loadUserAddresses = async () => {
  addressesLoading.value = true
  try {
    await addressStore.fetchAddresses()
    addresses.value = addressStore.addressList

    // 如果没有选中地址，且有默认地址，则使用默认地址
    if (!selectedAddress.value && addresses.value.length > 0) {
      selectedAddress.value = addressStore.defaultAddress || addresses.value[0]
    }
  } catch (error) {
    console.error('加载地址列表失败:', error)
    ElMessage.error('加载地址列表失败，请稍后重试')
  } finally {
    addressesLoading.value = false
  }
}

/**
 * 打开地址选择对话框
 */
const openAddressDialog = () => {
  addressDialogVisible.value = true
}

/**
 * 选择地址
 */
const selectAddress = (address) => {
  selectedAddress.value = address;
  // 如果地址变更，同时更新表单数据
  order.value.addressId = address.id;
  order.value.addressName = address.name;
  order.value.addressPhone = address.phone;
  order.value.addressDetail = address.address;
}

/**
 * 更新订单地址
 */
const updateOrderAddress = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  try {
    // 这里应该有一个更新订单地址的API，但目前没有实现
    // 模拟更新成功
    order.value.addressId = selectedAddress.value.id
    order.value.addressName = selectedAddress.value.name
    order.value.addressPhone = selectedAddress.value.phone
    order.value.addressDetail = selectedAddress.value.address

    ElMessage.success('收货地址已更新')
    addressDialogVisible.value = false
  } catch (error) {
    console.error('更新地址失败:', error)
    ElMessage.error('更新地址失败，请稍后重试')
  }
}

/**
 * 地址添加成功回调
 */
const handleAddressSuccess = (address) => {
  addressFormVisible.value = false
  loadUserAddresses()
  // 选中新添加的地址
  selectedAddress.value = address
  // 重新打开地址选择对话框
  setTimeout(() => {
    addressDialogVisible.value = true
  }, 300)
}

/**
 * 返回订单详情或列表
 */
const goBack = () => {
  if (orderId) {
    router.push(`/order/detail/${orderId}`)
  } else {
    router.push('/order/list')
  }
}

/**
 * 页面挂载时加载数据
 */
onMounted(() => {
  loadOrder()
})

/**
 * 页面销毁前清除定时器
 */
onBeforeUnmount(() => {
  clearInterval(timer.value)
})
</script>

<template>
  <AppLayout>
    <div class="order-pay-container" v-loading="loading">
      <div class="page-header">
        <el-button type="text" icon="ArrowLeft" @click="goBack">返回</el-button>
      </div>

      <div class="pay-header">
        <h2>订单支付</h2>

        <div class="countdown">
          <span class="countdown-label">支付剩余时间：</span>
          <span class="countdown-time">{{ countdownText }}</span>
        </div>
      </div>

      <div class="order-info" v-if="order.id">
        <div class="order-number">
          <span>订单号：{{ order.id }}</span>
          <span>下单时间：{{ order.createTime }}</span>
        </div>

        <div class="order-amount">
          <span class="amount-label">支付金额：</span>
          <span class="amount-value">¥{{ formatAmount }}</span>
        </div>

        <div class="order-goods">
          <div class="goods-shop">{{ order.shopName }}</div>
          <div v-if="order.items && order.items.length" class="goods-list">
            <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="goods-item">
              <div class="goods-image" v-if="item.goodsImage">
                <img :src="item.goodsImage" alt="商品图片" />
              </div>
              <div class="goods-details">
                <span class="goods-name">{{ item.goodsName }}</span>
                <span v-if="item.skuName" class="goods-sku">规格：{{ item.skuName }}</span>
                <span class="goods-price">¥{{ (item.price / 100).toFixed(2) }}</span>
              </div>
              <div class="goods-count">x{{ item.count }}</div>
              <div class="goods-subtotal">¥{{ (item.price * item.count / 100).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="order-address">
          <div class="address-header">
            <div class="address-title">收货信息</div>
            <el-button type="primary" size="small" @click="openAddressDialog">修改地址</el-button>
          </div>
          <div class="address-content" v-if="selectedAddress">
            <div class="address-info">
              <div class="contact">
                <span class="name">{{ selectedAddress.name }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
                <el-tag v-if="selectedAddress.isDefault" size="small" type="success">默认</el-tag>
              </div>
              <div class="detail">{{ selectedAddress.address }}</div>
            </div>
          </div>
          <div class="address-empty" v-else>
            <p>暂无收货地址</p>
            <el-button type="primary" size="small" @click="openAddressDialog">添加地址</el-button>
          </div>
        </div>
      </div>

      <div class="payment-methods">
        <h3>支付方式</h3>

        <div class="method-list">
          <div class="method-item" :class="{ active: payType === 1 }" @click="selectPayType(1)">
            <span class="method-icon wechat-icon">
              <i class="el-icon-wechat"></i>
            </span>
            <span class="method-name">微信支付</span>
          </div>

          <div class="method-item" :class="{ active: payType === 2 }" @click="selectPayType(2)">
            <span class="method-icon alipay-icon">
              <i class="el-icon-alipay"></i>
            </span>
            <span class="method-name">支付宝</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="pay-btn" @click="payOrder" :disabled="paying">
          {{ paying ? '支付中...' : '立即支付' }}
        </button>
        <button class="cancel-btn" @click="cancelOrder">取消订单</button>
        <button class="skip-btn" @click="skipPayment">暂不支付</button>
      </div>

      <!-- 地址选择对话框 -->
      <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="600px">
        <div class="address-dialog-content" v-loading="addressesLoading">
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
              <el-radio v-model="selectedAddress.id" :label="address.id" @change="selectAddress(address)">选择</el-radio>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateOrderAddress">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<style scoped>
.order-pay-container {
  width: 80%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.countdown-time {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.order-info {
  margin-bottom: 30px;
}

.order-number {
  display: flex;
  justify-content: space-between;
  color: #606266;
  margin-bottom: 15px;
}

.order-amount {
  margin: 20px 0;
}

.amount-label {
  font-size: 16px;
  color: #606266;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
  margin-left: 10px;
}

.order-goods {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.goods-shop {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.goods-list {
  margin-top: 10px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 14px;
  margin-bottom: 5px;
}

.goods-sku {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.goods-price {
  color: #f56c6c;
}

.goods-count {
  color: #606266;
  margin: 0 15px;
}

.goods-subtotal {
  color: #f56c6c;
  font-weight: bold;
  width: 80px;
  text-align: right;
}

.order-address {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f8f8;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.address-title {
  font-weight: bold;
}

.address-content {
  color: #606266;
  line-height: 1.5;
}

/* 地址选择对话框样式 */
.address-dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

.address-dialog-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-dialog-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.address-dialog-item.active {
  border-color: #409eff;
  background-color: #f0f9ff;
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

.default-tag {
  display: inline-block;
  font-size: 12px;
  padding: 2px 5px;
  background-color: #f56c6c;
  color: #fff;
  border-radius: 2px;
  margin-left: 5px;
}

.detail {
  color: #606266;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.payment-methods {
  margin-bottom: 30px;
}

.method-list {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item.active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.method-icon {
  font-size: 24px;
  margin-right: 10px;
}

.wechat-icon {
  color: #07c160;
}

.alipay-icon {
  color: #1677ff;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.pay-btn,
.cancel-btn,
.skip-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.pay-btn {
  background-color: #409eff;
  color: white;
}

.pay-btn:hover {
  background-color: #66b1ff;
}

.pay-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f56c6c;
  color: white;
}

.cancel-btn:hover {
  background-color: #f78989;
}

.skip-btn {
  background-color: #909399;
  color: white;
}

.skip-btn:hover {
  background-color: #a6a9ad;
}

.page-header {
  margin-bottom: 15px;
}
</style>
