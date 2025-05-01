<template>
  <el-dialog
    :title="isEdit ? '编辑地址' : '添加地址'"
    v-model="dialogVisible"
    width="500px"
  >
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
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  address: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 对话框可见性
const dialogVisible = ref(props.modelValue)

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: props.address.id || 0,
  name: props.address.name || '',
  phone: props.address.phone || '',
  address: props.address.address || '',
  isDefault: props.address.isDefault || false
})

// 监听address变化，更新表单数据
watch(() => props.address, (val) => {
  Object.assign(form, {
    id: val.id || 0,
    name: val.name || '',
    phone: val.phone || '',
    address: val.address || '',
    isDefault: val.isDefault || false
  })
}, { deep: true })

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
      // 提交表单数据到父组件
      emit('submit', {
        id: form.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        isDefault: form.isDefault
      })
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

/**
 * 取消操作
 */
const handleCancel = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.address-form {
  margin: 0 auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>