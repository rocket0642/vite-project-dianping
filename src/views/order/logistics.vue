<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()

// 状态
const loading = ref(true)
const mapLoading = ref(true)
const order = ref({})
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
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 加载高德地图脚本
 */
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    // 先清除可能存在的脚本，避免多个key冲突
    const existingScript = document.getElementById('amap-script')
    if (existingScript) {
      document.head.removeChild(existingScript)
    }
    
    // 设置安全密钥配置，必须在脚本加载前设置
    window._AMapSecurityConfig = {
      securityJsCode: 'your_security_js_code' // 可选安全密钥
    }
    
    // 创建新的脚本元素
    const script = document.createElement('script')
    script.id = 'amap-script'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=9e0fe96fdb8d2d03a0ac62e97bcf30cb&callback=initAMap`
    script.async = true
    
    // 定义回调函数
    window.initAMap = () => {
      AMap.value = window.AMap
      resolve(window.AMap)
    }
    
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * 初始化地图
 */
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    mapLoading.value = true
    
    // 加载高德地图脚本
    await loadMapScript()
    
    // 创建地图实例
    mapInstance.value = new AMap.value.Map(mapContainer.value, {
      zoom: 8,
      center: [120.142423, 30.262454] // 杭州坐标
    })
    
    // 创建起点标记
    const startMarker = new AMap.value.Marker({
      position: [116.397428, 39.90923], // 北京坐标
      map: mapInstance.value,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      title: '发货地-上海'
    })
    
    // 创建终点标记
    const endMarker = new AMap.value.Marker({
      position: [120.142423, 30.262454], // 杭州坐标
      map: mapInstance.value,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      title: '收货地-杭州'
    })
    
    // 使用AMap.DrivingRoute绘制路线
    const driving = new AMap.value.Driving({
      map: mapInstance.value,
      panel: false
    })
    
    // 设置路线
    driving.search(
      [116.397428, 39.90923], // 起点
      [120.142423, 30.262454], // 终点
      {
        waypoints: [
          [118.778074, 32.057236] // 南京中转站
        ]
      },
      (status, result) => {
        mapLoading.value = false
        if (status === 'complete') {
          console.log('路线规划成功')
          
          // 缩放地图以适应路线
          mapInstance.value.setFitView()
          
          // 添加南京中转点标记
          new AMap.value.Marker({
            position: [118.778074, 32.057236],
            map: mapInstance.value,
            icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png',
            title: '南京中转站'
          })
        } else {
          console.error('路线规划失败:', result)
          ElMessage.warning('物流路线规划失败，显示基本地图')
        }
      }
    )
  } catch (error) {
    console.error('地图加载失败:', error)
    mapLoading.value = false
    ElMessage.error(`地图初始化失败: ${error.message}`)
  }
}

/**
 * 返回订单详情
 */
const goToOrderDetail = () => {
  router.push(`/order/detail/${orderId}`)
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
          <el-button type="primary" size="small" @click="goToOrderDetail">
            返回订单详情
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

.amap-container {
  height: 100%;
  width: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
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
