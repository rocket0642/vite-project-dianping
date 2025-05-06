<script setup>
import { ElCarousel, ElCarouselItem, ElCol, ElImage, ElRow } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import ShopCard from '../../components/ShopCard.vue'
import ShopTypeNav from '../../components/ShopTypeNav.vue'
import { useGoodsStore } from '../../stores/goods'
import { useShopStore } from '../../stores/shop'

// 路由实例
const router = useRouter()

// 商品状态管理
const goodsStore = useGoodsStore()

// 商铺状态管理
const shopStore = useShopStore()

// 轮播图数据
const banners = ref([])

// 推荐商铺列表
const recommendShops = ref([])

/**
 * 加载轮播图数据
 * 从商品列表中随机获取5个商品作为轮播图
 */
const loadBanners = async () => {
  try {
    // 获取商品作为轮播图
    const recommendGoods = await goodsStore.fetchRecommendGoods(5)

    // 将商品数据转换为轮播图格式
    banners.value = recommendGoods.map((item, index) => ({
      id: item.id,
      imgUrl: item.images,
      link: `/product/${item.id}`,
      name: item.name
    }))

  } catch (error) {
    console.error('加载轮播图数据失败:', error)
  }
}

/**
 * 加载推荐商铺数据
 * 按评分排序，最多展示4个
 */
const loadRecommendShops = async () => {
  try {
    // 按评分排序并限制返回4个商铺
    await shopStore.fetchShopList({
      sortBy: 'score',
      limit: 4
    })

    if (shopStore.shopList && shopStore.shopList.length > 0) {
      recommendShops.value = shopStore.shopList
    }
  } catch (error) {
    console.error('加载推荐商铺失败:', error)
  }
}

/**
 * 页面加载时执行
 */
onMounted(() => {
  // 加载数据
  loadBanners()
  loadRecommendShops()
  console.log('首页加载完成')
})
</script>

<template>
  <AppLayout>
    <!-- 主要内容区 -->
    <div class="home-container">
      <!-- 商铺类型导航 -->
      <ShopTypeNav />

      <!-- 轮播图 -->
      <div class="banner">
        <el-carousel height="400px" indicator-position="outside">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <el-image :src="item.imgUrl" fit="cover" class="banner-image" @click="router.push(item.link)" />
            <div class="banner-title">{{ item.name }}</div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 推荐商铺 -->
      <div class="recommend-shops">
        <h2 class="section-title">推荐商铺</h2>
        <el-row :gutter="20">
          <el-col v-for="shop in recommendShops" :key="shop.id" :xs="24" :sm="12" :md="8" :lg="6" class="shop-col">
            <ShopCard :shop="shop" />
          </el-col>
        </el-row>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@import '../../assets/styles/global.css';

/* 轮播图样式 */
.banner {
  margin-bottom: 30px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 10px;
  text-align: center;
  font-size: 18px;
}

/* 推荐商铺样式 */
.recommend-shops {
  margin-bottom: 30px;
}

.shop-col {
  margin-bottom: 20px;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
  /* 减小上下内边距 */
}
</style>