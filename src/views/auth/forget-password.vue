<script setup>
import { ElMessage } from 'element-plus'
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

// 获取路由实例
const router = useRouter()
const userStore = useUserStore()
const code = ref('')

// 验证码有效期定时器
const codeValidTimer = ref(null)

// 当前步骤
const currentStep = ref(1) // 1:输入手机号和验证码, 2:设置新密码

// 表单数据
const forgetForm = reactive({
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
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== forgetForm.password) {
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

  // 清除旧的验证码有效期定时器
  if (codeValidTimer.value) {
    clearTimeout(codeValidTimer.value)
    codeValidTimer.value = null
  }

  // 调用获取验证码接口
  try {
    const res = await userStore.fetchCode(forgetForm.phone, 'reset')
    if (res.success) {
      // 验证码已发送
      code.value = res.data
      ElMessage.success('验证码已发送，有效期为两分钟')
      
      // 设置验证码两分钟有效期
      codeValidTimer.value = setTimeout(() => {
        code.value = '' // 清空验证码
        ElMessage.warning('验证码已过期，请重新获取')
        codeValidTimer.value = null
      }, 2 * 60 * 1000) // 两分钟后清空
    } else {
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
 * 验证验证码
 */
const verifyCode = async () => {
  // 表单验证
  try {
    await formRef.value.validateField(['phone', 'code'])
  } catch (error) {
    return
  }

  // 验证码验证
  if (!code.value) {
    ElMessage.error('验证码已过期，请重新获取')
    return
  }
  
  if (forgetForm.code !== code.value) {
    ElMessage.error('验证码错误')
    return
  }
  
  ElMessage.success('验证码正确')
  // 进入下一步
  currentStep.value = 2
  
  // 清除验证码有效期定时器，因为验证已通过
  if (codeValidTimer.value) {
    clearTimeout(codeValidTimer.value)
    codeValidTimer.value = null
  }
}

/**
 * 重置密码提交
 */
const handleResetPassword = async () => {
  // 表单验证
  try {
    await formRef.value.validateField(['password', 'confirmPassword'])
  } catch (error) {
    return
  }

  try {
    // 调用重置密码接口
    const res = await userStore.resetUserPassword(
      forgetForm.phone,
      forgetForm.code,
      forgetForm.password
    )

    if (res.success) {
      ElMessage.success('密码重置成功，请登录')
      // 密码重置成功后跳转到登录页
      router.push('/login')
    } else {
      ElMessage.error(res.errorMsg || '密码重置失败，请稍后重试')
    }
  } catch (error) {
    // 密码重置失败处理
    console.error('密码重置失败:', error)
    ElMessage.error('密码重置失败，请稍后重试')
  }
}

/**
 * 返回登录页
 */
const goToLogin = () => {
  router.push('/login')
}

// 组件卸载时清除所有定时器
onUnmounted(() => {
  if (codeButtonStatus.timer) {
    clearInterval(codeButtonStatus.timer)
  }
  if (codeValidTimer.value) {
    clearTimeout(codeValidTimer.value)
  }
})
</script>

<template>
  <div class="forget-container">
    <div class="forget-box">
      <div class="forget-header">
        <h2>忘记密码</h2>
        <p>点评电商平台</p>
      </div>

      <div class="back-button">
        <el-button icon="ArrowLeft" type="text" @click="$router.push('/')">返回首页</el-button>
      </div>

      <el-steps :active="currentStep" finish-status="success" simple style="margin: 20px 0">
        <el-step title="验证手机号" />
        <el-step title="设置新密码" />
      </el-steps>

      <el-form ref="formRef" :model="forgetForm" :rules="rules" label-position="top" class="forget-form">
        <!-- 步骤1: 手机号和验证码 -->
        <template v-if="currentStep === 1">
          <!-- 手机号输入框 -->
          <el-form-item prop="phone" label="手机号">
            <el-input v-model="forgetForm.phone" placeholder="请输入手机号" maxlength="11">
              <template #prefix>
                <el-icon>
                  <Iphone />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item prop="code" label="验证码">
            <div class="code-input-group">
              <el-input v-model="forgetForm.code" placeholder="请输入验证码" maxlength="6">
                <template #prefix>
                  <el-icon>
                    <Key />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" :disabled="codeButtonStatus.disabled" @click="getVerificationCode">
                {{ codeButtonStatus.text }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 下一步按钮 -->
          <el-form-item>
            <el-button type="primary" class="forget-button" @click="verifyCode">
              下一步
            </el-button>
          </el-form-item>
        </template>

        <!-- 步骤2: 设置新密码 -->
        <template v-else>
          <!-- 新密码 -->
          <el-form-item prop="password" label="新密码">
            <el-input v-model="forgetForm.password" type="password" placeholder="请输入新密码" show-password>
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 确认新密码 -->
          <el-form-item prop="confirmPassword" label="确认新密码">
            <el-input v-model="forgetForm.confirmPassword" type="password" placeholder="请确认新密码" show-password>
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 确定按钮 -->
          <el-form-item>
            <el-button type="primary" class="forget-button" @click="handleResetPassword">
              确定
            </el-button>
          </el-form-item>
        </template>

        <!-- 登录链接 -->
        <div class="form-footer">
          <span>放弃修改？</span>
          <a @click="goToLogin">立即登录</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.forget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
}

.forget-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.forget-header {
  text-align: center;
  margin-bottom: 30px;
}

.forget-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.forget-header p {
  font-size: 14px;
  color: #999;
}

.forget-form {
  margin-top: 20px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group .el-input {
  flex: 1;
}

.forget-button {
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

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}
</style>
