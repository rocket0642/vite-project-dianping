<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElCarousel, ElCarouselItem, ElImage, ElRow, ElCol } from 'element-plus'
import AppLayout from '../../components/AppLayout.vue'
import ShopCard from '../../components/ShopCard.vue'
import ShopTypeNav from '../../components/ShopTypeNav.vue'
import { getShopList } from '../../api/shop'

// 路由实例
const router = useRouter()

// 轮播图数据
const banners = ref([
  { id: 1, imgUrl: 'https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg', link: '/shop/type/1' },
  { id: 2, imgUrl: 'https://p0.meituan.net/wedding/d9dc9123ecf39c99a5ee4df9ea37fc23333192.jpg', link: '/shop/type/2' },
  { id: 3, imgUrl: 'https://p1.meituan.net/scarlett/e8efc66f0186abf3415ec815ded58aa9377348.jpg', link: '/shop/type/3' },
  { id: 4, imgUrl: 'https://p0.meituan.net/hotel/25ab95e6a80cdf0a5012ae9c9670ff6e1446003.jpg', link: '/shop/type/4' },
  { id: 5, imgUrl: 'https://p1.meituan.net/merchantpic/a0d6251daa4b29424e7195d34c3363d9143272.jpg', link: '/shop/type/5' }
])

// 推荐商铺列表
const recommendShops = ref([])

/**
 * 加载推荐商铺数据
 * 按评分排序，最多展示4个
 */
const loadRecommendShops = async () => {
  try {
    // 按评分排序并限制返回4个商铺
    const res = await getShopList({
      sortBy: 'score',
      limit: 4
    })
    
    if (res && res.success) {
      recommendShops.value = res.data
      console.log('推荐商铺数据:', recommendShops.value)
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
        <el-carousel height="300px" indicator-position="outside">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <el-image 
              :src="item.imgUrl" 
              fit="cover"
              class="banner-image"
              @click="router.push(item.link)"
            />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 推荐商铺 -->
      <div class="recommend-shops">
        <h2 class="section-title">推荐商铺</h2>
        <el-row :gutter="20">
          <el-col 
            v-for="shop in recommendShops" 
            :key="shop.id" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6"
            class="shop-col"
          >
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
}

.banner-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 推荐商铺样式 */
.recommend-shops {
  margin-bottom: 30px;
}

.shop-col {
  margin-bottom: 20px;
}
</style>