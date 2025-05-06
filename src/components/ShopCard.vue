<script setup>
import { ElImage } from 'element-plus'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 定义props
const props = defineProps({
  // 商铺信息
  shop: {
    type: Object,
    required: true
  }
})

/**
 * 跳转到商铺详情页
 */
const goToShopDetail = () => {
  router.push(`/shop/${props.shop.id}`)
}
</script>

<template>
  <div class="shop-card" @click="goToShopDetail">
    <div class="shop-image">
      <el-image :src="shop.images" fit="cover" />
    </div>
    <div class="shop-info">
      <h3 class="shop-name">{{ shop.name }}</h3>
      <div class="shop-meta">
        <span class="shop-type">{{ shop.typeName }}</span>
        <span class="shop-area">{{ shop.area }}</span>
      </div>
      <div class="shop-price">
        <span class="price">¥{{ shop.avgPrice }}/人</span>
      </div>
      <div class="shop-stats">
        <span class="sold">已售{{ shop.sold }}</span>
        <span class="score">评分{{ shop.score / 10 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.shop-card:hover {
  transform: translateY(-5px);
}

.shop-image {
  height: 180px;
  overflow: hidden;
}

.shop-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
}

.shop-card:hover .shop-image .el-image {
  transform: scale(1.05);
}

.shop-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 18px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shop-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.shop-price {
  margin-bottom: 8px;
}

.price {
  color: #f60;
  font-weight: bold;
}

.shop-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  margin-top: auto;
}
</style>