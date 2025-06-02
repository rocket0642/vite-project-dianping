<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import AddressDialog from '../../components/order/AddressDialog.vue'
import OrderItem from '../../components/order/OrderItem.vue'
import OrderTabs from '../../components/order/OrderTabs.vue'
import { useAfterSaleStore } from '../../stores/afterSale'
import { useOrderStore } from '../../stores/order'

// 导入组合式函数
import { useAddressManagement } from '../../composables/order/useAddressManagement'
import { useCountdown } from '../../composables/order/useCountdown'
import { useOrderList } from '../../composables/order/useOrderList'
import { useOrderOperations } from '../../composables/order/useOrderOperations'

// 路由和存储
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const afterSaleStore = useAfterSaleStore()

// 使用组合式函数
const {
  loading,
  orders,
  activeTab,
  currentPage,
  pageSize,
  total,
  tabToStatusMap,
  loadOrders,
  handleTabChange,
  handlePageChange
} = useOrderList(router)

const {
  countdowns,
  startCountdowns,
  clearAllTimers
} = useCountdown(orders, loadOrders, orderStore)

const {
  addressDialogVisible,
  addresses,
  addressesLoading,
  openAddressDialog,
  updateOrderAddress
} = useAddressManagement(router)

const {
  viewOrderDetail,
  goToPay,
  cancelOrder,
  confirmOrder,
  buyAgain,
  goToComment,
  applyAfterSale,
  viewLogistics,
  viewAfterSaleDetail,
  goToGoodsDetail,
  goToShopDetail
} = useOrderOperations(router, orderStore, afterSaleStore, loadOrders)

// 初始化
onMounted(async () => {
  const status = parseInt(route.query.status) || 0;
  const fromUserCenter = route.query.fromUserCenter === 'true';
  const statusToTabMap = {
    0: 'all',
    2: 'paid',
    1: 'unpaid',
    3: 'canceled',
    4: 'unreceived',
    5: 'uncommented',
    6: 'afterSale'
  };

  // 如果URL中有状态参数，则使用它，否则使用store中保存的activeTab
  if (route.query.status) {
    const tabName = statusToTabMap[status] || 'all';
    orderStore.orderListPageState.activeTab = tabName;

    // 如果是从个人中心点击过来的，重置页码为1
    if (fromUserCenter) {
      orderStore.orderListPageState.paginationState[tabName].currentPage = 1;
    }
  }

  await loadOrders();
  startCountdowns();
});

// 监听路由参数变化
watch(
  () => route.query,
  (newQuery) => {
    const status = parseInt(newQuery.status) || 0;
    const fromUserCenter = newQuery.fromUserCenter === 'true';
    const statusToTabMap = {
      0: 'all',
      2: 'paid',
      1: 'unpaid',
      3: 'canceled',
      4: 'unreceived',
      5: 'uncommented',
      6: 'afterSale'
    };

    // 仅当路由状态参数与当前activeTab不一致时更新
    const newTab = statusToTabMap[status] || 'all';
    if (newTab !== orderStore.orderListPageState.activeTab || fromUserCenter) {
      orderStore.orderListPageState.activeTab = newTab;

      // 如果是从个人中心点击过来的，重置页码为1
      if (fromUserCenter) {
        orderStore.orderListPageState.paginationState[newTab].currentPage = 1;
      }

      loadOrders().then(() => {
        startCountdowns();
      });
    }
  },
  { deep: true }
);

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  clearAllTimers()
})

// 辅助函数 - 用于地址更新
const handleUpdateAddress = (address) => {
  updateOrderAddress(address, orders.value)
}
</script>

<template>
  <AppLayout>
    <div class="order-list-container" v-loading="loading">
      <div class="list-header">
        <el-button type="text" icon="ArrowLeft" @click="$router.push('/user')">返回个人中心</el-button>
      </div>

      <!-- 使用拆分出的OrderTabs组件 -->
      <OrderTabs :active-tab="activeTab" @tab-change="handleTabChange" />

      <div v-if="orders.length === 0" class="no-orders">
        暂无订单
      </div>

      <div v-else class="orders-scroll-container">
        <!-- 使用拆分出的OrderItem组件 -->
        <OrderItem v-for="order in orders" :key="order.id" :order="order" :countdown="countdowns[order.id]"
          @view-detail="viewOrderDetail" @go-to-pay="goToPay" @buy-again="buyAgain" @cancel-order="cancelOrder"
          @confirm-order="confirmOrder" @view-logistics="viewLogistics" @go-to-comment="goToComment"
          @apply-refund="applyAfterSale" @apply-after-sale="applyAfterSale"
          @view-after-sale-detail="viewAfterSaleDetail" @go-to-shop-detail="goToShopDetail"
          @go-to-goods-detail="goToGoodsDetail" @open-address-dialog="openAddressDialog" />

        <!-- 分页组件 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
            layout="prev, pager, next" @current-change="handlePageChange" background />
        </div>
      </div>

      <!-- 使用拆分出的AddressDialog组件 -->
      <AddressDialog :visible="addressDialogVisible" @update:visible="addressDialogVisible = $event"
        :addresses="addresses" :loading="addressesLoading" @confirm="handleUpdateAddress"
        @cancel="addressDialogVisible = false" />
    </div>
  </AppLayout>
</template>

<style scoped>
.order-list-container {
  width: 80%;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.orders-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.orders-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.orders-scroll-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.orders-scroll-container::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

.list-header {
  margin-bottom: 15px;
}

.no-orders {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-size: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .order-list-container {
    width: 95%;
    padding: 10px;
  }
}
</style>
