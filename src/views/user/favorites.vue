<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFravoriteStore } from '../../stores/fravorite'
import { useUserStore } from '../../stores/user'
import AppLayout from '../../components/AppLayout.vue'
import ShopCard from '../../components/ShopCard.vue'
import { ElSkeleton, ElSkeletonItem, ElEmpty } from 'element-plus'

// 路由实例
const router = useRouter()

// 状态管理
const favoriteStore = useFravoriteStore()
const userStore = useUserStore()
const loading = ref(true)

// 获取收藏的商店并按类型分组
const favoritesByType = computed(() => {
    const grouped = {}

    favoriteStore.favoriteList.forEach(shop => {
        const typeId = shop.typeId
        const typeName = shop.typeName || '未分类'

        if (!grouped[typeId]) {
            grouped[typeId] = {
                typeName: typeName,
                shops: []
            }
        }

        grouped[typeId].shops.push(shop)
    })

    return Object.values(grouped)
})

/**
 * 加载收藏数据
 */
const loadFavorites = async () => {
    loading.value = true
    try {
        await favoriteStore.getFavoriteList()
    } catch (error) {
        console.error('获取收藏列表失败:', error)
    } finally {
        loading.value = false
    }
}

/**
 * 取消收藏
 */
const removeFavorite = async (shopId) => {
    await favoriteStore.removeFavorite(shopId)
}

// 页面加载时获取数据
onMounted(async () => {
    // 检查用户是否登录
    if (!userStore.isLogin) {
        router.push('/login?redirect=/user/favorites')
        return
    }

    await loadFavorites()
})
</script>

<template>
    <AppLayout>
        <div class="favorites-container">
            <div class="page-header">
                <h1>我的收藏</h1>
                <el-button type="text" icon="ArrowLeft" @click="$router.push('/user')">返回个人中心</el-button>
            </div>

            <el-skeleton :loading="loading" animated>
                <template #template>
                    <div v-for="i in 3" :key="i" class="skeleton-section">
                        <el-skeleton-item variant="text" style="width: 200px; margin-bottom: 20px" />
                        <div class="skeleton-shops">
                            <div v-for="j in 3" :key="j" class="skeleton-shop">
                                <el-skeleton-item variant="image" style="width: 100%; height: 180px" />
                                <el-skeleton-item variant="text" style="margin-top: 10px" />
                                <el-skeleton-item variant="text" style="width: 60%" />
                            </div>
                        </div>
                    </div>
                </template>

                <template #default>
                    <div v-if="favoritesByType.length === 0" class="empty-state">
                        <el-empty description="您还没有收藏任何商铺">
                            <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
                        </el-empty>
                    </div>

                    <div v-else>
                        <div v-for="group in favoritesByType" :key="group.typeName" class="favorites-section">
                            <h2 class="type-title">{{ group.typeName }}</h2>
                            <div class="shops-grid">
                                <div v-for="shop in group.shops" :key="shop.id" class="shop-wrapper">
                                    <shop-card :shop="shop" />
                                    <div class="shop-actions">
                                        <el-button type="danger" size="small" text
                                            @click.stop="removeFavorite(shop.id)">
                                            取消收藏
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </el-skeleton>
        </div>
    </AppLayout>
</template>

<style scoped>
.favorites-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 15px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-header h1 {
    font-size: 24px;
    margin: 0;
}

.favorites-section {
    margin-bottom: 40px;
}

.type-title {
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
}

.shops-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.shop-wrapper {
    position: relative;
}

.shop-actions {
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: none;
}

.shop-wrapper:hover .shop-actions {
    display: block;
}

.skeleton-section {
    margin-bottom: 30px;
}

.skeleton-shops {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.skeleton-shop {
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .shops-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }

    .skeleton-shops {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
}

@media (max-width: 480px) {
    .shops-grid {
        grid-template-columns: 1fr;
    }

    .skeleton-shops {
        grid-template-columns: 1fr;
    }
}
</style>
