<script setup>
import { StarFilled } from '@element-plus/icons-vue'
import { ElButton, ElIcon, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFravoriteStore } from '../../stores/fravorite'
import ShopCard from '../ShopCard.vue'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 3
    }
})

const router = useRouter()
const favoriteStore = useFravoriteStore()

// 限制显示收藏数量
const recentFavorites = computed(() =>
    favoriteStore.favoriteList ? favoriteStore.favoriteList.slice(0, props.limit) : []
)
</script>

<template>
    <div class="section-card">
        <div class="section-header">
            <h3 class="section-title">我的收藏</h3>
            <el-button type="text" @click="$router.push('/user/favorites')">查看全部</el-button>
        </div>

        <el-skeleton :loading="loading" animated :count="3">
            <template #template>
                <div class="skeleton-favorites">
                    <el-skeleton-item variant="image" style="width: 100%; height: 120px; margin-bottom: 8px;" />
                    <el-skeleton-item variant="text" style="width: 60%; height: 16px;" />
                </div>
            </template>

            <template #default>
                <div v-if="recentFavorites.length > 0" class="favorites-grid">
                    <shop-card v-for="shop in recentFavorites" :key="shop.id" :shop="shop" />
                </div>
                <div v-else class="empty-favorites">
                    <el-icon><star-filled /></el-icon>
                    <p>您还没有收藏任何商铺</p>
                    <el-button type="primary" size="small" @click="$router.push('/')">去浏览商铺</el-button>
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

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #303133;
}

.favorites-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.skeleton-favorites {
    margin-bottom: 15px;
}

.empty-favorites {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: #909399;
}

.empty-favorites .el-icon {
    font-size: 32px;
    margin-bottom: 10px;
}

.empty-favorites p {
    margin: 10px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .favorites-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .favorites-grid {
        grid-template-columns: 1fr;
    }
}
</style>