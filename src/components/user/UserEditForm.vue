<script setup>
import { Plus } from '@element-plus/icons-vue'
import {
    ElButton, ElDatePicker, ElDialog, ElForm, ElFormItem, ElInput,
    ElMessage, ElRadio, ElRadioGroup, ElUpload
} from 'element-plus'
import { ref, watch } from 'vue'
import { useUserStore } from '../../stores/user'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    userInfo: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:visible', 'refresh'])

const userStore = useUserStore()

// 统一编辑表单数据
const editForm = ref({
    // 基本信息
    nickName: '',
    icon: '',
    city: '',
    introduce: '',
    gender: true,
    birthday: '',
    email: '',
    iconFile: null
})

// 监听对话框显示状态，确保每次打开都重新获取最新用户数据
watch(() => props.visible, (newVal) => {
    if (newVal) {
        // 如果对话框打开，强制同步最新用户信息到表单
        editForm.value = {
            nickName: props.userInfo.nickName || '',
            icon: props.userInfo.icon || '',
            city: props.userInfo.city || '',
            introduce: props.userInfo.introduce || '',
            gender: props.userInfo.gender !== undefined ? props.userInfo.gender : false,
            birthday: props.userInfo.birthday || '',
            email: props.userInfo.email || '',
            iconFile: null
        }
    }
})

/**
 * 处理图片上传
 * @param {Object} file - 上传的文件对象
 */
const handleAvatarChange = (file) => {
    // 创建一个临时URL用于预览
    if (file.raw) {
        // 检查文件类型
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.raw.type)) {
            ElMessage.error('只能上传JPG/PNG/GIF格式的图片！')
            return false
        }
        // 检查文件大小
        if (file.raw.size / 1024 / 1024 > 2) {
            ElMessage.error('图片大小不能超过2MB！')
            return false
        }

        // 创建临时URL预览图片
        editForm.value.icon = URL.createObjectURL(file.raw)
        ElMessage.success('头像已选择')

        // 这里可以保存文件对象以便后续处理
        editForm.value.iconFile = file.raw
        return false // 阻止自动上传
    }
}

/**
 * 提交编辑表单
 */
const submitEditForm = async () => {
    // 如果有新上传的头像文件，处理文件上传
    if (editForm.value.iconFile) {
        // 1. 如果有原头像，先删除原头像
        if (props.userInfo.icon) {
            try {
                // 调用删除图片API
                const deleteRes = await userStore.uploadUserDelete(props.userInfo.icon)
                if (deleteRes.success) {
                    console.log('原头像删除成功')
                } else {
                    console.warn('原头像删除失败:', deleteRes.errorMsg)
                }
            } catch (error) {
                console.error('删除原头像出错:', error)
            }
        }

        // 2. 上传新头像
        const formData = new FormData()
        formData.append('file', editForm.value.iconFile)
        formData.append('type', 'icon')

        try {
            // 调用API上传头像
            const uploadRes = await userStore.uploadUserSave(formData)
            if (uploadRes.success) {
                // 更新表单中的头像URL为服务器返回的URL
                editForm.value.icon = uploadRes.data
            } else {
                ElMessage.error('头像上传失败')
                return
            }
        } catch (error) {
            console.error('头像上传失败:', error)
            return
        }
    }

    if (editForm.value.nickName !== props.userInfo.nickName || editForm.value.icon !== props.userInfo.icon) {
        // 更新基本信息
        try {
            const res = await userStore.updateUser({
                nickName: editForm.value.nickName,
                icon: editForm.value.icon
            })
            if (res.success) {
                // 刷新token
                const res = await userStore.refreshAccessToken()
                if (!res.success) {
                    ElMessage.error('刷新token失败，请重新登录')
                    // 强制登出
                    userStore.clearUserData()
                    router.push('/login?redirect=/user')
                }
            } else {
                ElMessage.error('更新基本信息失败')
                return
            }
        } catch (error) {
            console.error('更新基本信息失败:', error)
            return
        }
    }

    if (editForm.value.city !== props.userInfo.city ||
        editForm.value.introduce !== props.userInfo.introduce ||
        editForm.value.gender !== props.userInfo.gender ||
        editForm.value.birthday !== props.userInfo.birthday ||
        editForm.value.email !== props.userInfo.email) {
        // 更新详细信息
        try {
            const res = await userStore.updateUserDetail({
                city: editForm.value.city,
                introduce: editForm.value.introduce,
                gender: editForm.value.gender,
                birthday: editForm.value.birthday,
                email: editForm.value.email
            })
            if (!res.success) {
                ElMessage.error('更新详细信息失败')
                return
            }
        } catch (error) {
            console.error('更新详细信息失败:', error)
            return
        }
    }
    ElMessage.success('个人信息更新成功')

    // 关闭对话框并触发刷新
    closeDialog()
    emit('refresh')
}

/**
 * 关闭对话框
 */
const closeDialog = () => {
    emit('update:visible', false)
}

/**
 * 图片上传前的处理
 */
const beforeAvatarUpload = (file) => {
    // 检查文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        ElMessage.error('只能上传JPG/PNG/GIF格式的图片！')
        return false
    }
    // 检查文件大小
    if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过2MB！')
        return false
    }
    return true
}
</script>

<template>
    <el-dialog :model-value="visible" @update:model-value="$emit('update:visible', $event)" title="编辑个人信息" width="500px"
        @close="closeDialog">
        <el-form :model="editForm" label-width="80px">
            <!-- 基本信息 -->
            <h4 class="form-section-title">基本信息</h4>
            <el-form-item label="头像">
                <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
                    :on-change="handleAvatarChange" :before-upload="beforeAvatarUpload"
                    accept="image/jpeg,image/png,image/gif">
                    <img v-if="editForm.icon" :src="editForm.icon" class="avatar">
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="昵称">
                <el-input v-model="editForm.nickName" placeholder="请输入昵称"></el-input>
            </el-form-item>

            <!-- 详细信息 -->
            <h4 class="form-section-title">详细信息</h4>
            <el-form-item label="性别">
                <el-radio-group v-model="editForm.gender">
                    <el-radio :label="true">女</el-radio>
                    <el-radio :label="false">男</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="城市">
                <el-input v-model="editForm.city" placeholder="请输入所在城市"></el-input>
            </el-form-item>
            <el-form-item label="生日">
                <el-date-picker v-model="editForm.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" style="width: 100%">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="editForm.email" placeholder="请输入邮箱地址"></el-input>
            </el-form-item>
            <el-form-item label="个人介绍">
                <el-input v-model="editForm.introduce" type="textarea" :rows="3" placeholder="请输入个人介绍"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="submitEditForm">保存</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.form-section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 5px 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
}

.avatar-uploader {
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
}

.avatar-uploader-icon:hover {
    border-color: #409eff;
}

.avatar-upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}
</style>