<script setup>
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  status: '已签收',
  number: 'SF1234567890',
  company: '顺丰速运',
  records: [
    { time: '2023-06-20 12:00:00', content: '【河南省南阳市】已签收,签收人:未知' },
    { time: '2023-06-20 09:30:00', content: '【河南省南阳市】派件中,派件员:未知,联系电话:未知' },
    { time: '2023-06-19 18:20:00', content: '【河南省南阳市】已到达河南省南阳市转运中心' },
    { time: '2023-06-18 21:15:00', content: '【上海市】已发出,下一站:河南省南阳市转运中心' },
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
    console.log(order.value)

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

  const shopCity = shop.value.address || '上海市'
  const receiverCity = order.value.addressDetail ? order.value.addressDetail.split('市')[0] + '市' : '河南省南阳市'
  // 将时间字符串转换为时间戳
  const Time = new Date(order.value.payTime).getTime()

  // 更新物流记录中的地点信息
  logisticsInfo.value.records = [
    { time: new Date(Time + 17 * 60 * 60000).toLocaleString(), content: `【${receiverCity}】已签收,签收人:${order.value.addressName || '未知'}` },
    { time: new Date(Time + 15 * 60 * 60000).toLocaleString(), content: `【${receiverCity}】派件中,派件员:张师傅,联系电话:13800138000` },
    { time: new Date(Time + 10 * 60 * 60000).toLocaleString(), content: `【${receiverCity}】已到达${receiverCity}转运中心` },
    { time: new Date(Time + 10 * 60 * 1000).toLocaleString(), content: `【${shopCity}】已发出,下一站:${receiverCity}转运中心` },
    { time: new Date(Time).toLocaleString(), content: `【${shopCity}】已揽收` }
  ]
}

/**
 * 加载高德地图脚本
 * 使用Promise封装地图脚本加载过程
 */
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    console.log('开始加载高德地图脚本...')
    
    // 先检查地图是否已加载
    if (window.AMap) {
      console.log('检测到高德地图已加载')
      AMap.value = window.AMap
      resolve(window.AMap)
      return
    }
    
    // 先清除可能存在的脚本，避免多个key冲突
    const existingScript = document.getElementById('amap-script')
    if (existingScript) {
      document.head.removeChild(existingScript)
    }
    
    // 设置全局回调函数
    const callbackName = 'initAMap_' + Date.now()
    window[callbackName] = function() {
      console.log('高德地图脚本加载成功(通过回调)')
      delete window[callbackName]
      AMap.value = window.AMap
      resolve(window.AMap)
    }
    
    // 创建新的脚本元素 - 使用CDN地址和回调
    const script = document.createElement('script')
    script.id = 'amap-script'
    // 使用国内CDN地址，更稳定，包含所需插件和回调
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=9e0fe96fdb8d2d03a0ac62e97bcf30cb&plugin=AMap.Scale,AMap.ToolBar,AMap.Driving,AMap.Geocoder&callback=${callbackName}`
    script.async = true
    script.onerror = (error) => {
      console.error('地图脚本加载失败:', error)
      delete window[callbackName]
      // 尝试使用备用方案创建一个简单的模拟地图
      createFallbackMap()
      reject(new Error('地图脚本加载失败，已使用备用地图'))
    }
    
    // 设置超时处理
    const timeout = setTimeout(() => {
      console.error('地图脚本加载超时')
      delete window[callbackName]
      createFallbackMap()
      reject(new Error('地图脚本加载超时，已使用备用地图'))
    }, 10000) // 10秒超时
    
    // 添加成功回调以清除超时计时器
    const originalCallback = window[callbackName]
    window[callbackName] = function() {
      clearTimeout(timeout)
      originalCallback()
    }
    
    document.head.appendChild(script)
    console.log('高德地图脚本已添加到页面')
  })
}

/**
 * 创建备用地图，当API加载失败时使用
 */
const createFallbackMap = () => {
  console.log('创建备用地图...')
  mapLoading.value = false
  
  // 检查容器是否存在
  if (!mapContainer.value) {
    console.error('地图容器不存在')
    return
  }
  
  // 安全获取地址信息
  let shopCity = '发货地'
  let receiverCity = '收货地'
  let logisticsNumber = 'SF1234567890'
  let logisticsCompany = '顺丰速运'
  
  try {
    // 尝试从order和shop中获取信息
    if (shop.value && shop.value.address) {
      const address = shop.value.address
      shopCity = address.includes('市') ? address.split('市')[0] + '市' : address
    }
    
    if (order.value) {
      if (order.value.addressDetail) {
        const address = order.value.addressDetail
        receiverCity = address.includes('市') ? address.split('市')[0] + '市' : address
      }
      
      // 尝试获取物流信息
      logisticsNumber = order.value.logisticsId || logisticsInfo.value.number || 'SF1234567890'
      logisticsCompany = order.value.logisticsCompany || logisticsInfo.value.company || '顺丰速运'
    }
  } catch (error) {
    console.error('获取地址信息失败:', error)
  }
  
  // 创建一个简单的div作为备用地图，包含基本物流路线信息
  const fallbackMapContainer = mapContainer.value
  fallbackMapContainer.innerHTML = `
    <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background-color:#f5f5f5; padding: 20px; box-sizing: border-box;">
      <div style="margin-bottom:15px; font-size:20px; color:#666;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div style="font-size:16px; color:#666; text-align:center; margin-bottom:15px;">
        物流路线图加载失败<br>
        <span style="font-size:14px; color:#999;">请查看下方物流记录了解包裹状态</span>
      </div>
      
      <!-- 简易物流路线图 -->
      <div style="width:100%; max-width:500px; border:1px solid #ddd; border-radius:8px; padding:15px; background-color:white; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; position:relative; margin-bottom:20px;">
          <!-- 起点 -->
          <div style="text-align:center; width:120px; z-index:1;">
            <div style="width:40px; height:40px; border-radius:50%; background-color:#409EFF; color:white; display:flex; align-items:center; justify-content:center; margin:0 auto 5px;">发</div>
            <div style="font-size:12px; color:#666;">${shopCity}</div>
          </div>
          
          <!-- 连接线 -->
          <div style="height:2px; background-color:#ddd; flex:1; position:relative; margin:0 10px;">
            <!-- 物流节点 -->
            <div style="position:absolute; top:-8px; left:25%; width:18px; height:18px; border-radius:50%; background-color:#f56c6c; color:white; font-size:12px; display:flex; align-items:center; justify-content:center;">1</div>
            <div style="position:absolute; top:-8px; left:50%; width:18px; height:18px; border-radius:50%; background-color:#f56c6c; color:white; font-size:12px; display:flex; align-items:center; justify-content:center;">2</div>
            <div style="position:absolute; top:-8px; left:75%; width:18px; height:18px; border-radius:50%; background-color:#f56c6c; color:white; font-size:12px; display:flex; align-items:center; justify-content:center;">3</div>
          </div>
          
          <!-- 终点 -->
          <div style="text-align:center; width:120px; z-index:1;">
            <div style="width:40px; height:40px; border-radius:50%; background-color:#67C23A; color:white; display:flex; align-items:center; justify-content:center; margin:0 auto 5px;">收</div>
            <div style="font-size:12px; color:#666;">${receiverCity}</div>
          </div>
        </div>
        
        <div style="font-size:12px; color:#999; text-align:center;">
          物流单号: ${logisticsNumber} | 
          物流公司: ${logisticsCompany}
        </div>
      </div>
    </div>
  `
  console.log('备用地图已创建')
}

/**
 * 获取地址的坐标
 * 使用高德地图地理编码API将地址转换为坐标
 * @param {string} address - 地址信息
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} - Promise解析为经纬度坐标 [lng, lat]
 */
const getAddressCoordinates = (address, city) => {
  return new Promise((resolve, reject) => {
    // 确保AMap已加载
    if (!AMap.value) {
      console.error('高德地图API未加载')
      // 返回默认坐标
      resolve([116.397428, 39.90923]) // 默认北京坐标
      return
    }
    
    try {
      console.log(`开始地理编码: 地址=${address}, 城市=${city}`)
      
      // 创建地理编码实例
      const geocoder = new AMap.value.Geocoder({
        city: city // 城市，默认"全国"
      })
      
      // 地理编码,返回地理编码结果
      geocoder.getLocation(address, (status, result) => {
        console.log('地理编码结果:', status, result)
        
        if (status === 'complete' && result.info === 'OK') {
          if (result.geocodes.length > 0) {
            const location = result.geocodes[0].location
            console.log(`地理编码成功: [${location.lng}, ${location.lat}]`)
            resolve([location.lng, location.lat])
          } else {
            console.warn('未找到匹配的地理坐标')
            // 找不到匹配坐标时使用城市默认坐标
            resolve(getFallbackCoordinates(city))
          }
        } else {
          console.warn(`地理编码失败: ${result.info || status}`)
          // 编码失败时使用预设坐标
          resolve(getFallbackCoordinates(city))
        }
      })
    } catch (error) {
      console.error('地理编码过程发生错误:', error)
      // 出错时使用预设坐标
      resolve(getFallbackCoordinates(city))
    }
  })
}

/**
 * 获取城市的备用坐标
 * 当地理编码失败时使用
 * @param {string} city - 城市名称
 * @returns {Array} - 经纬度坐标 [lng, lat]
 */
const getFallbackCoordinates = (city) => {
  // 预设的城市坐标
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
    '西安市': [108.9402, 34.3416],
    '河南省南阳市': [112.5283, 32.9908]
  }
  
  // 尝试从城市名中提取主要城市
  let cityName = city
  for (const key in cityCoordinates) {
    if (city.includes(key)) {
      cityName = key
      break
    }
  }
  
  // 返回找到的城市坐标或默认坐标（上海）
  return cityCoordinates[cityName] || [121.4737, 31.2304]
}

/**
 * 初始化地图
 * 创建地图实例并添加物流路线
 */
const initMap = async () => {
  if (!mapContainer.value) {
    console.error('地图容器元素不存在')
    return
  }
  
  try {
    mapLoading.value = true
    console.log('初始化地图...')
    
    // 设置尺寸，确保容器可见
    mapContainer.value.style.height = '300px'
    mapContainer.value.style.width = '100%'
    
    // 加载高德地图脚本
    await loadMapScript()
    
    // 获取物流起点和终点坐标
    // 从订单和店铺信息中获取实际地址
    const shopAddress = shop.value.address || '上海市'
    const shopCity = shopAddress.includes('市') ? 
      shopAddress.split('市')[0] + '市' : '上海市'
    const receiverAddress = order.value.addressDetail || '河南省南阳市'
    const receiverCity = receiverAddress.includes('市') ? 
      receiverAddress.split('市')[0] + '市' : '河南省南阳市'
    
    console.log('发货地址:', shopAddress)
    console.log('收货地址:', receiverAddress)
    
    // 异步获取坐标
    try {
      const startPosition = await getAddressCoordinates(shopAddress, shopCity)
      const endPosition = await getAddressCoordinates(receiverAddress, receiverCity)
      
      console.log('起点坐标:', startPosition)
      console.log('终点坐标:', endPosition)
      
      // 创建地图实例
      console.log('创建地图实例...')
      mapInstance.value = new AMap.value.Map(mapContainer.value, {
        zoom: 6,
        center: [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2], // 居中显示
        resizeEnable: true
      })
      
      // 添加地图控件
      try {
        mapInstance.value.addControl(new AMap.value.ToolBar())
        mapInstance.value.addControl(new AMap.value.Scale())
      } catch (error) {
        console.warn('添加地图控件失败:', error)
      }
      
      // 创建起点标记
      new AMap.value.Marker({
        position: startPosition,
        map: mapInstance.value,
        title: `发货地-${shopCity}`
      })
      
      // 创建终点标记
      new AMap.value.Marker({
        position: endPosition,
        map: mapInstance.value,
        title: `收货地-${receiverCity}`
      })
      
      // 创建路线
      await createRoute(startPosition, endPosition)
      mapLoading.value = false
      console.log('地图初始化完成')
    } catch (error) {
      console.error('获取坐标或创建地图失败:', error)
      createFallbackMap()
      mapLoading.value = false
    }
    
  } catch (error) {
    console.error('地图加载失败:', error)
    mapLoading.value = false
    // 尝试创建备用地图
    createFallbackMap()
  }
}

/**
 * 创建路线
 * 使用驾车路线规划或折线连接起点和终点
 * @param {Array} start - 起点坐标 [lng, lat]
 * @param {Array} end - 终点坐标 [lng, lat]
 */
const createRoute = async (start, end) => {
  try {
    console.log('尝试创建驾车路线...')
    // 检查驾车规划插件是否可用
    if (AMap.value.Driving) {
      // 创建驾车路线规划
      const driving = new AMap.value.Driving({
        map: mapInstance.value,
        panel: false, // 不使用路线详情面板
        policy: AMap.value.DrivingPolicy.LEAST_TIME // 最快路线
      })
      
      // 异步路线规划
      await new Promise((resolve, reject) => {
        driving.search(
          start,
          end,
          (status, result) => {
            if (status === 'complete' && result.routes) {
              console.log('驾车路线规划成功')
              resolve()
            } else {
              console.warn('驾车路线规划失败，使用备用方案')
              // 使用备用折线
              createBackupRoute(start, end)
              resolve()
            }
          }
        )
      })
    } else {
      console.warn('驾车路线规划插件不可用，使用备用方案')
      // 使用备用折线
      createBackupRoute(start, end)
    }
    
    // 调整地图视野以包含所有点
    mapInstance.value.setFitView()
  } catch (error) {
    console.error('创建路线失败:', error)
    // 使用备用折线
    createBackupRoute(start, end)
  }
}

/**
 * 创建备用路线
 * 当路线规划API失败时，使用简单折线连接起点和终点
 * @param {Array} start - 起点坐标 [lng, lat]
 * @param {Array} end - 终点坐标 [lng, lat]
 */
const createBackupRoute = (start, end) => {
  try {
    console.log('创建备用折线路线:', start, end)
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
  } catch (error) {
    console.error('创建备用路线失败:', error)
  }
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

  // 使用setTimeout让DOM完全渲染后再初始化地图
  // 增加延迟时间到1000ms，给页面更充足的渲染时间
  setTimeout(() => {
    try {
      console.log('开始延迟初始化地图...')
      initMap().catch(error => {
        console.error('地图初始化失败（捕获的Promise错误）:', error)
        // 创建备用地图
        createFallbackMap()
      })
    } catch (error) {
      console.error('地图初始化过程中发生异常:', error)
      createFallbackMap()
    }
  }, 1000)
})

// 修改组件销毁前清理资源的逻辑
onBeforeUnmount(() => {
  try {
    console.log('清理地图资源...')

    // 清理地图实例
    if (mapInstance.value) {
      mapInstance.value.destroy()
      mapInstance.value = null
      console.log('地图实例已销毁')
    }

    // 清除全局变量和回调
    if (window.initAMap) {
      window.initAMap = null
    }

    // 尝试移除地图脚本元素
    try {
      const script = document.getElementById('amap-script')
      if (script) {
        document.head.removeChild(script)
        console.log('地图脚本元素已移除')
      }
    } catch (e) {
      console.warn('移除地图脚本元素失败:', e)
    }

    console.log('地图资源清理完成')
  } catch (error) {
    console.error('清理地图资源时发生错误:', error)
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
              <div v-for="(record, index) in logisticsInfo.records" :key="index" class="record-item"
                :class="{ 'is-first': index === 0 }">
                <div class="record-time">{{ record.time }}</div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </div>
          </div>

          <!-- 添加商品信息展示 -->
          <div class="order-goods-section">
            <h3>订单商品</h3>
            <div v-if="order.items && order.items.length" class="order-products">
              <div v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="goods-item">
                <div class="goods-image" v-if="item.goodsImage">
                  <img :src="item.goodsImage" alt="商品图片" />
                </div>
                <div class="goods-content">
                  <div class="goods-name">{{ item.goodsName }}</div>
                  <div class="goods-quantity">x{{ item.count }}</div>
                  <div class="goods-price">¥{{ (item.price / 100).toFixed(2) }}</div>
                </div>
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
            <div>收货地址: {{ order.addressDetail || '河南省南阳市文化路100号' }}</div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.logistics-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
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

.loading-container,
.map-loading {
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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

.order-goods-section {
  padding: 15px;
  border-top: 1px solid #ebeef5;
}

.order-goods-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
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
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-name {
  flex: 1;
  font-size: 14px;
}

.goods-quantity {
  color: #606266;
  margin: 0 10px;
}

.goods-price {
  color: #f56c6c;
  font-weight: bold;
}
</style>
