<script setup>
import { Document } from '@element-plus/icons-vue'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ElIcon, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { onMounted, onUnmounted, ref, watch } from 'vue'

// 注册 ECharts 需要的组件
echarts.use([
    BarChart,
    PieChart,
    LineChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    CanvasRenderer
])

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    orderStatistics: {
        type: Object,
        default: () => ({
            orderStatus: [],
            monthlySpending: [],
            totalOrders: 0,
            totalAmount: 0
        })
    }
})

// 图表实例引用
const orderStatusChartRef = ref(null)
const monthlySpendingChartRef = ref(null)
let orderStatusChart = null
let monthlySpendingChart = null

/**
 * 初始化订单状态饼图
 */
const initOrderStatusChart = () => {
    // 确保DOM元素已经渲染
    if (!orderStatusChartRef.value) return

    // 如果图表已经存在，则销毁重建
    if (orderStatusChart) {
        orderStatusChart.dispose()
    }

    // 创建图表实例
    orderStatusChart = echarts.init(orderStatusChartRef.value)

    // 准备数据
    const statusData = props.orderStatistics.orderStatus.filter(item => item.value > 0)

    // 设置图表配置
    const option = {
        title: {
            text: '订单状态分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 10,
            data: statusData.map(item => item.name)
        },
        series: [
            {
                name: '订单状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '14',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: statusData.map(item => ({
                    value: item.value,
                    name: item.name
                }))
            }
        ]
    }

    // 应用配置
    orderStatusChart.setOption(option)

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        orderStatusChart && orderStatusChart.resize()
    })
}

/**
 * 初始化月度消费趋势折线图
 */
const initMonthlySpendingChart = () => {
    // 确保DOM元素已经渲染
    if (!monthlySpendingChartRef.value) return

    // 如果图表已经存在，则销毁重建
    if (monthlySpendingChart) {
        monthlySpendingChart.dispose()
    }

    // 创建图表实例
    monthlySpendingChart = echarts.init(monthlySpendingChartRef.value)

    // 准备数据
    const days = props.orderStatistics.monthlySpending.map(item => item.day)
    const amounts = props.orderStatistics.monthlySpending.map(item => item.amount)

    // 设置图表配置
    const option = {
        title: {
            text: '近14天消费趋势',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c} 元'
        },
        xAxis: {
            type: 'category',
            data: days,
            axisLabel: {
                formatter: value => value.split('-')[2] + '日'
            }
        },
        yAxis: {
            type: 'value',
            name: '消费金额(元)'
        },
        series: [
            {
                data: amounts,
                type: 'line',
                smooth: true,
                name: '消费金额',
                areaStyle: {
                    opacity: 0.3
                },
                itemStyle: {
                    color: '#409EFF'
                },
                lineStyle: {
                    width: 3
                }
            }
        ],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        }
    }

    // 应用配置
    monthlySpendingChart.setOption(option)

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        monthlySpendingChart && monthlySpendingChart.resize()
    })
}

// 监听统计数据变化，初始化图表
watch(() => props.orderStatistics, (newVal) => {
    if (!props.loading && newVal.totalOrders > 0) {
        // 在数据加载完成后初始化图表
        setTimeout(() => {
            initOrderStatusChart()
            initMonthlySpendingChart()
        }, 100)
    }
}, { deep: true })

// 组件挂载后初始化图表
onMounted(() => {
    if (!props.loading && props.orderStatistics.totalOrders > 0) {
        setTimeout(() => {
            initOrderStatusChart()
            initMonthlySpendingChart()
        }, 100)
    }
})

// 组件卸载时清理图表实例
onUnmounted(() => {
    if (orderStatusChart) {
        orderStatusChart.dispose()
        orderStatusChart = null
    }
    if (monthlySpendingChart) {
        monthlySpendingChart.dispose()
        monthlySpendingChart = null
    }

    // 移除事件监听
    window.removeEventListener('resize', () => { })
})
</script>

<template>
    <div class="section-card">
        <h3 class="section-title">数据统计</h3>
        <el-skeleton :loading="loading" animated>
            <template #template>
                <div class="skeleton-statistics">
                    <div class="skeleton-chart">
                        <el-skeleton-item variant="p" style="width: 100%; height: 300px;" />
                    </div>
                    <div class="skeleton-chart">
                        <el-skeleton-item variant="p" style="width: 100%; height: 300px;" />
                    </div>
                </div>
            </template>

            <template #default>
                <div v-if="orderStatistics.totalOrders === 0" class="empty-statistics">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <p>暂无订单数据</p>
                </div>
                <div v-else class="statistics-container">
                    <div class="statistics-summary">
                        <div class="summary-item">
                            <div class="summary-value">{{ orderStatistics.totalOrders }}</div>
                            <div class="summary-label">总订单数</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">¥{{ (orderStatistics.totalAmount / 100).toFixed(2) }}</div>
                            <div class="summary-label">总消费金额</div>
                        </div>
                    </div>

                    <div class="statistics-charts">
                        <div ref="orderStatusChartRef" class="chart-container"></div>
                        <div ref="monthlySpendingChartRef" class="chart-container"></div>
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<style scoped>
.section-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 15px 0;
    color: #303133;
}

/* 统计图表样式 */
.statistics-container {
    margin-top: 20px;
}

.statistics-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 8px;
}

.summary-item {
    text-align: center;
}

.summary-value {
    font-size: 28px;
    font-weight: bold;
    color: #409eff;
}

.summary-label {
    font-size: 14px;
    color: #606266;
    margin-top: 5px;
}

.statistics-charts {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.chart-container {
    width: 100%;
    height: 300px;
}

.empty-statistics {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
    color: #909399;
}

.empty-statistics .el-icon {
    font-size: 48px;
    margin-bottom: 15px;
}

.skeleton-statistics {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skeleton-chart {
    width: 100%;
}

@media (min-width: 768px) {
    .statistics-charts {
        flex-wrap: nowrap;
    }

    .chart-container {
        width: 50%;
    }
}

@media (max-width: 768px) {
    .statistics-summary {
        flex-direction: column;
        gap: 15px;
    }

    .chart-container {
        height: 250px;
    }
}
</style>