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
const userInfo = computed(() => userStore.userInfo)

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
                    <el-skeleton-item variant="circle" style="width: 80px; height: 80px;" />
                    <div class="skeleton-user-details">
                        <el-skeleton-item variant="text" style="width: 150px; height: 24px; margin-bottom: 12px;" />
                        <el-skeleton-item variant="text" style="width: 240px; height: 16px; margin-bottom: 8px;" />
                        <el-skeleton-item variant="text" style="width: 300px; height: 16px;" />
                    </div>
                </div>
            </template>

            <template #default>
                <div class="user-header">
                    <div class="avatar-container">
                        <el-avatar :size="100"
                            :src="userInfo.icon || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                    </div>
                    <div class="user-basic-info">
                        <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
                        <div class="edit-btn-container">
                            <el-button type="primary" size="small" @click="openEditDialog" class="edit-btn">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                编辑资料
                            </el-button>
                        </div>
                    </div>
                </div>

                <div class="user-info-grid">
                    <div class="info-item">
                        <div class="info-label">性别:</div>
                        <div class="info-value">{{ userInfo.gender ? '女' : '男' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">城市:</div>
                        <div class="info-value">{{ userInfo.city || '未设置' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">生日:</div>
                        <div class="info-value">{{ userInfo.birthday || '未设置' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">邮箱:</div>
                        <div class="info-value">{{ userInfo.email || '未设置' }}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="info-label">个人介绍:</div>
                        <div class="info-value">{{ userInfo.introduce || '这个人很懒，什么都没留下' }}</div>
                    </div>
                </div>
            </template>
        </el-skeleton>

        <div class="user-actions">
            <el-button type="danger" @click="logout">退出登录</el-button>
        </div>
    </div>
</template>

<style scoped>
.user-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.user-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.avatar-container {
    margin-right: 20px;
}

.user-basic-info {
    flex: 1;
    position: relative;
}

.edit-btn-container {
    position: absolute;
    top: 0;
    right: 0;
}

.user-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    border-top: 1px solid #ebeef5;
    padding-top: 15px;
}

.info-item {
    display: flex;
    align-items: baseline;
}

.full-width {
    grid-column: span 2;
}

.info-label {
    width: 80px;
    color: #606266;
    font-weight: 500;
}

.info-value {
    flex: 1;
    color: #303133;
}

.user-actions {
    display: flex;
    justify-content: center;
}

.skeleton-user-info {
    display: flex;
    align-items: center;
}

.skeleton-user-details {
    flex: 1;
    margin-left: 20px;
}

@media (max-width: 768px) {
    .edit-btn-container {
        position: static;
        margin-top: 10px;
    }

    .user-info-grid {
        grid-template-columns: 1fr;
    }

    .full-width {
        grid-column: span 1;
    }
}
</style>