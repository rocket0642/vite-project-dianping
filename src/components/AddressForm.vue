<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
    class="address-form"
  >
    <el-form-item label="收货人" prop="name">
      <el-input v-model="form.name" placeholder="请输入收货人姓名" />
    </el-form-item>
    
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入手机号码" />
    </el-form-item>
    
    <el-form-item label="详细地址" prop="address">
      <el-input 
        v-model="form.address" 
        type="textarea" 
        :rows="3"
        placeholder="请输入详细地址信息" 
      />
    </el-form-item>
    
    <el-form-item>
      <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">保存</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import { addUserAddress, updateUserAddress } from '../api/address'

const props = defineProps({
  // 如果传入地址对象，则为编辑模式
  address: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['success', 'cancel'])

const formRef = ref(null)

// 表单数据
const form = reactive({
  id: props.address?.id || 0,
  name: props.address?.name || '',
  phone: props.address?.phone || '',
  address: props.address?.address || '',
  isDefault: props.address?.isDefault || false
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        let res
        if (form.id) {
          // 更新地址
          res = await updateUserAddress({
            id: form.id,
            name: form.name,
            phone: form.phone,
            address: form.address,
            isDefault: form.isDefault
          })
        } else {
          // 添加地址
          res = await addUserAddress({
            name: form.name,
            phone: form.phone,
            address: form.address,
            isDefault: form.isDefault
          })
        }
        
        if (res.success) {
          ElMessage.success(form.id ? '地址更新成功' : '地址添加成功')
          emit('success', res.data)
        } else {
          ElMessage.error(res.errorMsg || '操作失败')
        }
      } catch (error) {
        console.error('保存地址失败:', error)
        ElMessage.error('保存失败，请稍后重试')
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

/**
 * 重置表单
 */
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.address-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>