<script setup>
import { Edit } from '@element-plus/icons-vue'
import {
    ElAvatar, ElButton, ElIcon, ElSkeleton, ElSkeletonItem, ElMessageBox, ElMessage
} from 'element-plus'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['edit'])

// 路由实例
const router = useRouter()

// 用户状态
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

/**
 * 打开编辑对话框
 */
const openEditDialog = () => {
    emit('edit')
}

/**
 * 退出登录
 */
const logout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await userStore.logout()
            // 主动登出时直接跳转到登录页，不带重定向参数
            router.push('/login')
            ElMessage.success('退出登录成功')
        } catch (error) {
            // 即使登出失败也强制清除数据并跳转
            userStore.clearUserData()
            router.push('/login')
            ElMessage.error('登出过程中出错，已强制登出')
        }
    }).catch(() => { })
}
</script>

<template>
    <div class="user-card">
        <el-skeleton :loading="loading" animated>
            <template #template>
                <div class="skeleton-user-info">
                    <el-skeleton-item variant="circle" style="width: 100px; height: 100px;" />
                    <div class="skeleton-user-details">
                        <el-skeleton-item variant="text" style="width: 150px; height: 24px; margin-bottom: 12px;" />
                        <el-skeleton-item variant="text" style="width: 240px; height: 16px; margin-bottom: 8px;" />
                        <el-skeleton-item variant="text" style="width: 300px; height: 16px;" />
                    </div>
                </div>
            </template>

            <template #default>
                <div class="user-header">
                    <div class="user-header-left">
                        <div class="avatar-container">
                            <el-avatar :size="100"
                                :src="userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                        </div>
                        <div class="user-basic-info">
                            <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
                            <div class="user-status">
                                <div class="status-badge">{{ userInfo.vip ? 'VIP会员' : '普通会员' }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="user-header-right">
                        <el-button type="primary" size="small" @click="openEditDialog" class="edit-btn">
                            <el-icon>
                                <Edit />
                            </el-icon>
                            编辑资料
                        </el-button>
                        <el-button type="danger" size="small" @click="logout">退出登录</el-button>
                    </div>
                </div>

                <div class="user-info-container">
                    <div class="user-info-grid">
                        <div class="info-item">
                            <div class="info-label">性别</div>
                            <div class="info-value">{{ userInfo.gender === 1 ? '女' : '男' }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">城市</div>
                            <div class="info-value">{{ userInfo.city || '未设置' }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">生日</div>
                            <div class="info-value">{{ userInfo.birthday || '未设置' }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">邮箱</div>
                            <div class="info-value">{{ userInfo.email || '未设置' }}</div>
                        </div>
                    </div>
                    <div class="user-introduce">
                        <div class="info-label">个人介绍</div>
                        <div class="info-value introduce-text">{{ userInfo.introduce || '这个人很懒，什么都没留下' }}</div>
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<style scoped>
.user-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 24px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
}

.user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    position: relative;
}

.user-header-left {
    display: flex;
    align-items: center;
}

.user-header-right {
    display: flex;
    gap: 10px;
}

.avatar-container {
    margin-right: 20px;
    position: relative;
}

.avatar-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 24px;
    height: 24px;
    background-color: #67c23a;
    border-radius: 50%;
    border: 3px solid #fff;
    display: none;
    /* 可以根据用户在线状态显示 */
}

.user-basic-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
}

.user-status {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.status-badge {
    background-color: #f2f6fc;
    color: #409eff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    display: inline-block;
}

.user-info-container {
    background-color: #f8f9fc;
    border-radius: 8px;
    padding: 20px;
}

.user-info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 4px;
}

.info-value {
    color: #303133;
    font-weight: 500;
}

.user-introduce {
    border-top: 1px dashed #e4e7ed;
    padding-top: 16px;
}

.introduce-text {
    margin-top: 8px;
    line-height: 1.6;
}

.skeleton-user-info {
    display: flex;
    align-items: center;
}

.skeleton-user-details {
    flex: 1;
    margin-left: 20px;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .user-info-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .user-header {
        flex-direction: column;
        align-items: center;
    }

    .user-header-left {
        flex-direction: column;
        align-items: center;
        margin-bottom: 16px;
        text-align: center;
    }

    .avatar-container {
        margin-right: 0;
        margin-bottom: 16px;
    }

    .user-header-right {
        width: 100%;
        justify-content: center;
    }

    .user-basic-info {
        align-items: center;
    }

    .user-info-grid {
        grid-template-columns: 1fr;
    }
}
</style>