<template>
  <el-dialog
    :title="isEdit ? '编辑地址' : '添加地址'"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="收货人" prop="name">
        <el-input v-model="formData.name" placeholder="请输入收货人姓名"></el-input>
      </el-form-item>
      
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号码"></el-input>
      </el-form-item>
      
      <el-form-item label="详细地址" prop="address">
        <el-input
          v-model="formData.address"
          type="textarea"
          rows="3"
          placeholder="请输入详细地址"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="设为默认">
        <el-switch v-model="formData.isDefault"></el-switch>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElButton, ElForm, ElFormItem, ElInput, ElSwitch } from 'element-plus'
import { ref, watch } from 'vue'

const props = defineProps({
  address: {
    type: Object,
    required: true
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

const formData = ref({
  id: 0,
  name: '',
  phone: '',
  address: '',
  isDefault: false
})

const formRules = {
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

const formRef = ref(null)

// 当props.address变化时更新表单数据
watch(() => props.address, (newVal) => {
  formData.value = { ...newVal }
}, { immediate: true, deep: true })

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', formData.value)
    }
  })
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