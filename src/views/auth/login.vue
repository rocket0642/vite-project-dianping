<script setup>
import { ElMessage } from 'element-plus'
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getHistoryAccounts, removeHistoryAccount, saveHistoryAccount, getLastPhone } from '../../utils/storage'

// 获取路由实例和用户状态管理
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 登录方式切换 - 修改为默认密码登录
const loginType = ref('password') // 'password'为密码登录，'code'为验证码登录

// 表单数据
const loginForm = reactive({
  phone: '',
  code: '',
  password: '',
  imageCaptcha: '',
  remember: false
})

// 历史账号
const historyAccounts = ref([])
const showHistory = ref(false)

// 获取历史账号
const fetchHistoryAccounts = () => {
  historyAccounts.value = getHistoryAccounts()
}

// 选择历史账号
const selectAccount = (phone) => {
  loginForm.phone = phone
  showHistory.value = false
}

// 删除历史账号
const deleteAccount = (e, phone) => {
  e.stopPropagation() // 阻止事件冒泡
  removeHistoryAccount(phone)
  fetchHistoryAccounts()
  ElMessage.success('已删除该账号记录')
}

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
  imageCaptcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码必须是4位', trigger: 'blur' }
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

const rememberMe = ref(false)

// 图形验证码
const captchaImage = ref('')
const loading = ref(false)

/**
 * 获取验证码
 */
const getCode = async () => {
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
    const res = await userStore.fetchCode(loginForm.phone, 'login')
    console.log(res)
    if (res.success) {
      ElMessage.success('验证码已发送，两分钟内有效')
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
 * 刷新验证码
 */
const refreshCaptcha = async () => {
  try {
    const res = await userStore.fetchCaptcha()
    if (res.success) {
      captchaImage.value = res.data.captchaImage
    } else {
      ElMessage.error('获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

/**
 * 登录提交
 */
const handleLogin = async () => {
  // 表单验证
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  // 验证图形验证码
  if (!loginForm.imageCaptcha) {
    ElMessage.error('请输入图形验证码')
    return
  }

  try {
    loading.value = true

    let res;
    // 根据登录方式调用不同的登录接口
    if (loginType.value === 'code') {
      res = await userStore.userLogin(
        loginForm.phone,
        loginForm.code,
        null,
        loginForm.imageCaptcha,
        loginForm.remember
      )
    } else {
      res = await userStore.userLogin(
        loginForm.phone,
        null,
        loginForm.password,
        loginForm.imageCaptcha,
        loginForm.remember
      )
    }

    if (res && res.success) {
      // 将成功登录的账号添加到历史记录
      saveHistoryAccount(loginForm.phone)

      ElMessage.success('登录成功')
      // 登录成功后跳转
      if (userStore.isAdmin) {
        router.push('/admin')
      } else {
        const redirectUrl = route.query.redirect || '/'
        router.replace(redirectUrl)
      }
    } else if (res) {
      ElMessage.error(res.errorMsg || '登录失败')
      // 如果是验证码错误，刷新验证码
      if (res.errorMsg?.includes('验证码')) {
        refreshCaptcha()
      }
    }
  } catch (error) {
    // 登录失败处理
    console.error('登录失败:', error)
    // 显示错误信息
    if (error.errorMsg) {
      ElMessage.error(error.errorMsg)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

/**
 * 切换登录方式
 */
const switchLoginType = (type) => {
  loginType.value = type
}

/**
 * 跳转到注册页面
 */
const goToRegister = () => {
  router.push('/register')
}

/**
 * 跳转到忘记密码页面
 */
const goToForgetPassword = () => {
  router.push('/forget-password')
}

// 是否有历史账号
const hasHistoryAccounts = computed(() => historyAccounts.value.length > 0)

onMounted(() => {
  // 获取历史账号列表
  fetchHistoryAccounts()

  // 自动填充上次使用的手机号
  const lastPhone = getLastPhone()
  if (lastPhone) {
    loginForm.phone = lastPhone
  }

  // 加载验证码
  refreshCaptcha()
})
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>欢迎登录</h2>
        <p>点评电商平台</p>
      </div>

      <div class="back-button">
        <el-button icon="ArrowLeft" type="text" @click="$router.push('/')">返回首页</el-button>
      </div>

      <div class="login-tabs">
        <div :class="['tab-item', { active: loginType === 'password' }]" @click="switchLoginType('password')">
          密码登录
        </div>
        <div :class="['tab-item', { active: loginType === 'code' }]" @click="switchLoginType('code')">
          验证码登录
        </div>
      </div>

      <el-form ref="formRef" :model="loginForm" :rules="rules" label-position="top" class="login-form">
        <!-- 手机号输入框 -->
        <el-form-item prop="phone" label="手机号">
          <div class="phone-input-group">
            <el-input v-model="loginForm.phone" placeholder="请输入手机号" maxlength="11"
              @focus="showHistory = hasHistoryAccounts">
              <template #prefix>
                <el-icon>
                  <Iphone />
                </el-icon>
              </template>
              <template #suffix v-if="hasHistoryAccounts">
                <el-icon class="history-icon" @click="showHistory = !showHistory">
                  <ArrowDown v-if="!showHistory" />
                  <ArrowUp v-else />
                </el-icon>
              </template>
            </el-input>

            <!-- 历史账号下拉框 -->
            <div class="history-dropdown" v-if="showHistory && hasHistoryAccounts">
              <ul class="history-list">
                <li v-for="account in historyAccounts" :key="account" @click="selectAccount(account)"
                  class="history-item">
                  <span>{{ account }}</span>
                  <el-icon class="delete-icon" @click.stop="deleteAccount($event, account)">
                    <Delete />
                  </el-icon>
                </li>
              </ul>
            </div>
          </div>
        </el-form-item>

        <!-- 验证码登录 -->
        <template v-if="loginType === 'code'">
          <el-form-item prop="code" label="验证码">
            <div class="code-input-group">
              <el-input v-model="loginForm.code" placeholder="请输入验证码" maxlength="6">
                <template #prefix>
                  <el-icon>
                    <Key />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" :disabled="codeButtonStatus.disabled" @click="getCode">
                {{ codeButtonStatus.text }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 密码登录 -->
        <template v-else>
          <el-form-item prop="password" label="密码">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password>
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </template>

        <!-- 图形验证码 -->
        <el-form-item prop="imageCaptcha" label="图形验证码">
          <div class="captcha-container">
            <el-input v-model="loginForm.imageCaptcha" placeholder="请输入图形验证码" :maxlength="4" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
              <div v-else class="captcha-loading">加载中...</div>
            </div>
          </div>
        </el-form-item>

        <!-- 记住我和忘记密码放在图形验证码下方 -->
        <div class="extra-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <a class="forget-link" @click="goToForgetPassword">忘记密码?</a>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div class="form-footer">
          <span>还没有账号？</span>
          <a @click="goToRegister">立即注册</a>
        </div>

      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.login-form {
  margin-top: 20px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group .el-input {
  flex: 1;
}

.login-button {
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

/* 新增样式 */
.extra-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  font-size: 14px;
}

.forget-link {
  color: #409eff;
  cursor: pointer;
}

/* 历史账号下拉菜单样式 */
.phone-input-group {
  position: relative;
  width: 100%;
}

.phone-input-group .el-input {
  width: 100%;
}

.history-icon {
  cursor: pointer;
  color: #909399;
}

.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin-top: 5px;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.delete-icon {
  color: #909399;
  font-size: 16px;
}

.delete-icon:hover {
  color: #f56c6c;
}

/* 确保所有输入框样式一致 */
.el-form-item {
  width: 100%;
}

.el-input {
  width: 100%;
}

.code-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

/* 修正验证码输入框组样式 */
.code-input-group .el-input {
  flex: 1;
}

.code-input-group .el-button {
  flex-shrink: 0;
  /* 可以固定宽度以保持一致性 */
  min-width: 110px;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.captcha-image:hover {
  opacity: 0.8;
}

.captcha-loading {
  width: 120px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>