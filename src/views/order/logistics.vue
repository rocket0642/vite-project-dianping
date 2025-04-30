<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import { useOrderStore } from '../../stores/order'
import AMapLoader from '@amap/amap-jsapi-loader'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const orderStore = useOrderStore()

// 状态
const loading = ref(true)
const order = ref({})
const orderId = parseInt(route.params.id)
const mapContainer = ref(null)
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
 * 初始化高德地图
 */
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: 'your_amap_key', // 需要替换为您的高德地图API密钥
      version: '2.0',
      plugins: ['AMap.Driving', 'AMap.ToolBar', 'AMap.Scale']
    })
    
    // 创建地图实例
    const map = new AMap.Map(mapContainer.value, {
      viewMode: '3D',
      zoom: 12,
      center: [120.142423, 30.262454] // 杭州市中心坐标
    })
    
    // 添加工具条和比例尺
    map.addControl(new AMap.ToolBar())
    map.addControl(new AMap.Scale())
    
    // 构造路线导航实例
    const driving = new AMap.Driving({
      policy: AMap.DrivingPolicy.LEAST_TIME,
      map: map
    })
    
    // 模拟配送路线
    driving.search(
      [116.396749, 39.908685], // 起点（模拟商家地址）
      [120.142423, 30.262454], // 终点（模拟收货地址）
      (status, result) => {
        if (status === 'complete') {
          // 绘制路线完成
          console.log('绘制配送路线成功')
        } else {
          console.error('配送路线绘制失败', result)
        }
      }
    )
  } catch (error) {
    console.error('地图加载失败:', error)
  }
}

/**
 * 返回订单详情
 */
const goToOrderDetail = () => {
  router.push(`/order/${orderId}`)
}

// 初始化
onMounted(() => {
  loadOrderDetail()
  initMap()
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
          <div class="map-container" ref="mapContainer"></div>
          
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

.loading-container {
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
