<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCode, register } from '../../api/user'

// 获取路由实例
const router = useRouter()

// 表单数据
const registerForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 表单校验规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单引用
const formRef = ref(null)

// 获取验证码按钮状态
const codeButtonStatus = reactive({
  disabled: false,
  text: '获取验证码',
  timer: null,
  countdown: 60
})

/**
 * 获取验证码
 */
const getVerificationCode = async () => {
  // 验证手机号
  try {
    await formRef.value.validateField('phone')
  } catch (error) {
    return
  }
  
  // 禁用按钮并开始倒计时
  codeButtonStatus.disabled = true
  codeButtonStatus.countdown = 60
  codeButtonStatus.text = `${codeButtonStatus.countdown}秒后重新获取`
  
  codeButtonStatus.timer = setInterval(() => {
    codeButtonStatus.countdown--
    codeButtonStatus.text = `${codeButtonStatus.countdown}秒后重新获取`
    
    if (codeButtonStatus.countdown <= 0) {
      clearInterval(codeButtonStatus.timer)
      codeButtonStatus.disabled = false
      codeButtonStatus.text = '获取验证码'
    }
  }, 1000)
  
  // 调用获取验证码接口
  try {
    const res = await getCode(registerForm.phone)
    if (res.success) {
      ElMessage.success('验证码已发送，请查看控制台')
    } else {
      // 如果手机号已注册，提示用户去登录
      ElMessage.warning(res.errorMsg || '获取验证码失败')
      // 重置按钮状态
      clearInterval(codeButtonStatus.timer)
      codeButtonStatus.disabled = false
      codeButtonStatus.text = '获取验证码'
    }
  } catch (error) {
    // 发送失败时重置按钮状态
    clearInterval(codeButtonStatus.timer)
    codeButtonStatus.disabled = false
    codeButtonStatus.text = '获取验证码'
    ElMessage.error('获取验证码失败，请稍后重试')
  }
}

/**
 * 注册提交
 */
const handleRegister = async () => {
  // 表单验证
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }
  
  try {
    // 调用注册接口
    const res = await register({
      phone: registerForm.phone,
      code: registerForm.code,
      password: registerForm.password
    })
    
    if (res.success) {
      ElMessage.success('注册成功，请登录')
      // 注册成功后跳转到登录页
      router.push('/login')
    } else {
      ElMessage.error(res.errorMsg || '注册失败，请稍后重试')
    }
  } catch (error) {
    // 注册失败处理
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请稍后重试')
  }
}

/**
 * 返回登录页
 */
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>点评电商平台</p>
      </div>
      
      <el-form 
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <!-- 手机号输入框 -->
        <el-form-item prop="phone" label="手机号">
          <el-input 
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 验证码 -->
        <el-form-item prop="code" label="验证码">
          <div class="code-input-group">
            <el-input 
              v-model="registerForm.code"
              placeholder="请输入验证码"
              maxlength="6"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              :disabled="codeButtonStatus.disabled"
              @click="getVerificationCode"
            >
              {{ codeButtonStatus.text }}
            </el-button>
          </div>
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item prop="password" label="密码">
          <el-input 
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="register-button"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <!-- 登录链接 -->
        <div class="form-footer">
          <span>已有账号？</span>
          <a @click="goToLogin">立即登录</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
}

.register-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 14px;
  color: #999;
}

.register-form {
  margin-top: 20px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group .el-input {
  flex: 1;
}

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.form-footer {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #409eff;
  cursor: pointer;
  margin-left: 5px;
}
</style>