<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <div>用户总数：{{ userStore.userCount }}</div>
            </div>
          </template>
          <div class="card-body">
            <div class="card-value">{{ userStore.userCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>商品总数</span>
            </div>
          </template>
          <div class="card-body">
            <div class="card-value">{{ goodsStore.goodsCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单总数</span>
            </div>
          </template>
          <div class="card-body">
            <div class="card-value">{{ orderStore.orderCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日销售额</span>
            </div>
          </template>
          <div class="card-body">
            <div class="card-value">¥{{ orderStore.todaySales }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近七日销量</span>
            </div>
          </template>
          <div class="chart-container" ref="salesChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商铺类型数量占比</span>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getWeekSales } from '@/api/order'
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { useGoodsStore } from '@/stores/goods'
import { useOrderStore } from '@/stores/order'
import { getShopTypeStats } from '@/api/shop'

const weekSales = ref([])
const salesChartRef = ref(null)
const userStore = useUserStore()
const goodsStore = useGoodsStore()
const orderStore = useOrderStore()
const shopTypes = ref([])
const categoryChartRef = ref(null)
let categoryChart = null

// 页面加载时自动获取用户总数
onMounted(async () => {
  await userStore.fetchUserCount()
  console.log('用户总数：', userStore.userCount)

  await goodsStore.fetchGoodsCount()
  console.log('商品总数：', goodsStore.goodsCount)

  await orderStore.fetchOrderCount()
  console.log('订单总数：', orderStore.orderCount)

  await orderStore.fetchTodaySales()

  const res = await getWeekSales()
  if (res.success) {
    weekSales.value = res.data
    renderSalesChart()
  }

  const typeRes = await getShopTypeStats()
  if (typeRes.success) {
    shopTypes.value = typeRes.data
    categoryChart = echarts.init(categoryChartRef.value)
    renderCategoryChart()
  }
})

function renderSalesChart() {
  if (!salesChartRef.value) return
  const chart = echarts.init(salesChartRef.value)
  const option = {
    xAxis: {
      type: 'category',
      data: weekSales.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: weekSales.value.map(item => item.sales),
      type: 'line'
    }]
  }
  chart.setOption(option)
}

function renderCategoryChart() {
  if (!categoryChart) return
  categoryChart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: shopTypes.value.map(item => item.name)
    },
    series: [{
      name: '商铺类型',
      type: 'pie',
      radius: '70%',
      center: ['50%', '60%'],
      data: shopTypes.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.el-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
  padding: 20px 0;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.chart-container {
  height: 400px;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
