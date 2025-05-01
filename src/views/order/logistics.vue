<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import { useShopStore } from '../../stores/shop'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()
const shopStore = useShopStore()

// 状态
const loading = ref(true)
const mapLoading = ref(true)
const order = ref({})
const shop = ref({})
const orderId = parseInt(route.params.id)
const mapContainer = ref(null)
const AMap = ref(null)
const mapInstance = ref(null)
const logisticsInfo = ref({
  status: '运输中',
  number: 'SF1234567890',
  company: '顺丰速运',
  records: [
    { time: '2023-06-20 12:00:00', content: '【杭州市】已签收,签收人:本人' },
    { time: '2023-06-20 09:30:00', content: '【杭州市】派件中,派件员:张师傅,联系电话:13800138000' },
    { time: '2023-06-19 18:20:00', content: '【杭州市】已到达杭州转运中心' },
    { time: '2023-06-18 21:15:00', content: '【上海市】已发出,下一站:杭州转运中心' },
    { time: '2023-06-18 15:40:00', content: '【上海市】已揽收' }
  ]
})

/**
 * 加载订单详情
 */
const loadOrderDetail = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderDetail(orderId)
    order.value = orderStore.currentOrder
    
    // 加载店铺信息
    if (order.value && order.value.shopId) {
      await loadShopInfo(order.value.shopId)
    }
    
    // 更新物流记录中的地点信息
    updateLogisticsRecords()
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 加载店铺信息
 * @param {number} shopId - 店铺ID
 */
const loadShopInfo = async (shopId) => {
  try {
    await shopStore.fetchShopDetail(shopId)
    shop.value = shopStore.currentShop
  } catch (error) {
    console.error('加载店铺信息失败:', error)
    ElMessage.error('加载店铺信息失败，请稍后重试')
  }
}

/**
 * 更新物流记录中的地点信息
 * 根据订单的店铺地址和收货地址更新物流记录
 */
const updateLogisticsRecords = () => {
  if (!order.value || !shop.value) return
  
  const shopCity = shop.value.city || '上海市'
  const receiverCity = order.value.addressDetail ? order.value.addressDetail.split('市')[0] + '市' : '杭州市'
  
  // 更新物流记录中的地点信息
  logisticsInfo.value.records = [
    { time: '2023-06-20 12:00:00', content: `【${receiverCity}】已签收,签收人:${order.value.addressName || '本人'}` },
    { time: '2023-06-20 09:30:00', content: `【${receiverCity}】派件中,派件员:张师傅,联系电话:13800138000` },
    { time: '2023-06-19 18:20:00', content: `【${receiverCity}】已到达${receiverCity}转运中心` },
    { time: '2023-06-18 21:15:00', content: `【${shopCity}】已发出,下一站:${receiverCity}转运中心` },
    { time: '2023-06-18 15:40:00', content: `【${shopCity}】已揽收` }
  ]
}

/**
 * 加载高德地图脚本
 * 使用Promise封装地图脚本加载过程
 */
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    // 先清除可能存在的脚本，避免多个key冲突
    const existingScript = document.getElementById('amap-script')
    if (existingScript) {
      document.head.removeChild(existingScript)
    }
    
    // 创建新的脚本元素
    const script = document.createElement('script')
    script.id = 'amap-script'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=9e0fe96fdb8d2d03a0ac62e97bcf30cb&plugin=AMap.Driving,AMap.ToolBar,AMap.Scale`
    script.async = true
    
    script.onload = () => {
      AMap.value = window.AMap
      resolve(window.AMap)
    }
    
    script.onerror = (error) => {
      console.error('地图脚本加载失败:', error)
      reject(new Error('地图脚本加载失败，请检查网络连接'))
    }
    
    document.head.appendChild(script)
  })
}

/**
 * 获取地址的坐标
 * 根据地址信息获取对应的经纬度坐标
 * @param {string} address - 地址信息
 * @param {string} city - 城市名称
 * @returns {Array} - 经纬度坐标 [lng, lat]
 */
const getAddressCoordinates = (address, city) => {
  // 这里使用模拟数据，实际应该调用高德地图的地理编码API
  // 为了简化，这里根据城市名称返回预设的坐标
  const cityCoordinates = {
    '上海市': [121.4737, 31.2304],
    '北京市': [116.4074, 39.9042],
    '广州市': [113.2644, 23.1291],
    '深圳市': [114.0579, 22.5431],
    '杭州市': [120.1420, 30.2594],
    '南京市': [118.7969, 32.0603],
    '武汉市': [114.3024, 30.5951],
    '成都市': [104.0668, 30.5728],
    '重庆市': [106.5516, 29.5630],
    '西安市': [108.9402, 34.3416]
  }
  
  // 提取城市名称
  let cityName = city
  if (!cityCoordinates[cityName]) {
    // 如果没有找到对应的城市坐标，尝试从地址中提取城市名
    for (const key in cityCoordinates) {
      if (address.includes(key)) {
        cityName = key
        break
      }
    }
  }
  
  // 如果仍然没有找到，返回默认坐标（上海）
  return cityCoordinates[cityName] || [121.4737, 31.2304]
}

/**
 * 初始化地图
 * 创建地图实例并添加物流路线
 */
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    mapLoading.value = true
    
    // 加载高德地图脚本
    await loadMapScript()
    
    // 获取物流起点和终点坐标
    // 从订单和店铺信息中获取实际地址
    const shopAddress = shop.value.address || '上海市'
    const shopCity = shop.value.city || '上海市'
    const receiverAddress = order.value.addressDetail || '杭州市'
    const receiverCity = receiverAddress.split('市')[0] + '市'
    
    const startPosition = getAddressCoordinates(shopAddress, shopCity)
    const endPosition = getAddressCoordinates(receiverAddress, receiverCity)
    
    // 创建地图实例
    mapInstance.value = new AMap.value.Map(mapContainer.value, {
      zoom: 8,
      center: [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2], // 居中显示
      resizeEnable: true
    })
    
    // 添加地图控件
    mapInstance.value.addControl(new AMap.value.ToolBar())
    mapInstance.value.addControl(new AMap.value.Scale())
    
    // 创建起点标记
    new AMap.value.Marker({
      position: startPosition,
      map: mapInstance.value,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      title: `发货地-${shopCity}`
    })
    
    // 创建终点标记
    new AMap.value.Marker({
      position: endPosition,
      map: mapInstance.value,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      title: `收货地-${receiverCity}`
    })
    
    // 使用简单的折线连接起点和终点
    createBackupRoute(startPosition, endPosition)
    mapLoading.value = false
    
  } catch (error) {
    console.error('地图加载失败:', error)
    mapLoading.value = false
    ElMessage.error(`地图初始化失败: ${error.message}`)
  }
}

/**
 * 创建备用路线
 * 当路线规划API失败时，使用简单折线连接起点和终点
 * @param {Array} start - 起点坐标 [lng, lat]
 * @param {Array} end - 终点坐标 [lng, lat]
 */
const createBackupRoute = (start, end) => {
  // 创建一个简单的折线路径
  const path = [
    start,
    // 添加一些中间点，使路线看起来更自然
    [start[0] + (end[0] - start[0]) * 0.25, start[1] + (end[1] - start[1]) * 0.3],
    [start[0] + (end[0] - start[0]) * 0.5, start[1] + (end[1] - start[1]) * 0.5],
    [start[0] + (end[0] - start[0]) * 0.75, start[1] + (end[1] - start[1]) * 0.7],
    end
  ]
  
  // 创建折线
  const polyline = new AMap.value.Polyline({
    path: path,
    strokeColor: '#3366FF',  // 线颜色
    strokeOpacity: 0.8,      // 线透明度
    strokeWeight: 6,         // 线宽
    strokeStyle: 'solid',    // 线样式
    lineJoin: 'round',       // 折线拐点连接处样式
    lineCap: 'round'         // 折线两端线帽样式
  })
  
  // 将折线添加到地图
  polyline.setMap(mapInstance.value)
  
  // 添加物流节点标记
  addBackupLogisticsNodes(path)
  
  // 调整地图视野以包含所有点
  mapInstance.value.setFitView()
  
  ElMessage.info('使用简化路线显示物流轨迹')
}

/**
 * 为备用路线添加物流节点标记
 * @param {Array} path - 路径点数组
 */
const addBackupLogisticsNodes = (path) => {
  // 跳过起点和终点，只在中间点添加节点标记
  for (let i = 1; i < path.length - 1; i++) {
    // 创建物流节点标记
    new AMap.value.Marker({
      position: path[i],
      map: mapInstance.value,
      content: `<div class="logistics-node">${i}</div>`,
      offset: new AMap.value.Pixel(-10, -10)
    })
  }
}


// 初始化
onMounted(() => {
  loadOrderDetail()
  
  // 让DOM完全渲染后再初始化地图
  setTimeout(() => {
    initMap()
  }, 500)
})

// 组件销毁时清理地图资源
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
  
  // 清除全局回调和配置
  if (window.initAMap) {
    window.initAMap = null
  }
  
  // 删除地图脚本
  const script = document.getElementById('amap-script')
  if (script) {
    document.head.removeChild(script)
  }
})
</script>

<template>
  <AppLayout>
    <div class="logistics-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载物流信息...</p>
      </div>
      
      <template v-else>
        <div class="page-header">
          <h1>物流详情</h1>
          <!-- 返回上一级 -->
          <el-button type="primary" size="small" @click="router.back()">
            返回
          </el-button>
        </div>
        
        <!-- 物流信息卡片 -->
        <div class="logistics-card">
          <div class="logistics-header">
            <div class="status">物流状态：{{ logisticsInfo.status }}</div>
            <div class="info">
              <div>物流单号：{{ logisticsInfo.number }}</div>
              <div>物流公司：{{ logisticsInfo.company }}</div>
            </div>
          </div>
          
          <!-- 物流轨迹地图 -->
          <div class="map-container">
            <div v-if="mapLoading" class="map-loading">
              <div class="loading-spinner"></div>
              <p>地图加载中...</p>
            </div>
            <div ref="mapContainer" class="amap-container"></div>
          </div>
          
          <!-- 物流记录 -->
          <div class="logistics-records">
            <h3>物流记录</h3>
            <div class="record-timeline">
              <div 
                v-for="(record, index) in logisticsInfo.records" 
                :key="index"
                class="record-item"
                :class="{ 'is-first': index === 0 }"
              >
                <div class="record-time">{{ record.time }}</div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 收货信息 -->
        <div class="address-card">
          <h3>收货信息</h3>
          <div class="address-info">
            <div>收货人: {{ order.addressName || '张三' }}</div>
            <div>联系电话: {{ order.addressPhone || '13800138000' }}</div>
            <div>收货地址: {{ order.addressDetail || '浙江省杭州市西湖区文三路100号' }}</div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.logistics-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 22px;
  color: #333;
  margin: 0;
}

.loading-container, .map-loading {
  text-align: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logistics-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.logistics-header {
  padding: 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ebeef5;
}

.status {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.info {
  display: flex;
  justify-content: space-between;
  color: #666;
}

.map-container {
  height: 300px;
  width: 100%;
  position: relative;
}

/* 物流节点样式 */
:deep(.logistics-node) {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 地图容器样式优化 */
.amap-container {
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

/* 地图加载动画优化 */
.map-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.logistics-records {
  padding: 15px;
}

.logistics-records h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.record-timeline {
  position: relative;
  padding-left: 20px;
}

.record-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dcdfe6;
}

.record-item {
  position: relative;
  padding-bottom: 20px;
}

.record-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dcdfe6;
}

.record-item.is-first::before {
  background-color: #409EFF;
}

.record-time {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.record-content {
  color: #333;
}

.address-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
}

.address-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.address-info {
  color: #666;
  line-height: 1.8;
}
</style>
