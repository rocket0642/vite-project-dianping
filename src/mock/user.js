import Mock from 'mockjs'

// 模拟用户数据
const users = [
  {
    id: 1,
    phone: '13800138000',
    password: '123456',
    nickName: '测试用户',
    icon: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    city: '杭州',
    introduce: '这是一个测试账号',
    fans: 10,
    followee: 20,
    gender: true,
    birthday: '2000-01-01',
    credits: 100,
    level: false,
    email: 'test@test.com',
  },
  {
    id: 2,
    phone: '18338319215',
    password: '123456',
    nickName: '测试用户2',
    icon: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    city: '杭州',
    introduce: '这是一个测试账号',
    fans: 10,
    followee: 20,
    gender: true,
    birthday: '2000-01-01',
    credits: 100,
    level: false,
    email: 'test@test.com',
  },
  {
    id: 3,
    phone: '18739004120',
    password: '123456',
    nickName: '测试用户3',
    icon: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    city: '杭州',
    introduce: '这是一个测试账号',
    fans: 10,
    followee: 20,
    gender: true,
    birthday: '2000-01-01',
    credits: 100,
    level: false,
    email: 'test@test.com',
  }
]

// 从token中统一获取userPhone的辅助函数
function getUserPhoneFromToken() {
  const userStore = JSON.parse(sessionStorage.getItem('user-store') || '{}')
  console.log(userStore)
  const userPhone = userStore.userPhone
  return userPhone? userPhone : ""
}


// 存储验证码
const codeMaps = {}

/**
 * 生成随机六位数验证码
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 获取验证码
 */
Mock.mock('/api/user/code', 'post', (options) => {
  const { phone } = JSON.parse(options.body)
  
  // 检查手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return {
      success: false,
      errorMsg: '手机号格式不正确'
    }
  }
  
  // 生成验证码
  const code = generateCode()
  codeMaps[phone] = code
  
  // 在控制台打印验证码，方便测试
  console.log(`手机号 ${phone} 的验证码是: ${code}`)
  
  return {
    success: true,
    data: '验证码发送成功'
  }
})

/**
 * 验证码登录
 */
Mock.mock('/api/user/login', 'post', (options) => {
  const { phone, code } = JSON.parse(options.body)
  
  // 检查手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return {
      success: false,
      errorMsg: '手机号格式不正确'
    }
  }
  
  // 检查验证码
  if (!code || codeMaps[phone] !== code) {
    return {
      success: false,
      errorMsg: '验证码错误'
    }
  }
  
  // 查找用户
  const user = users.find(u => u.phone === phone)
  
  // 如果用户不存在，提示用户去注册
  if (!user) {
    return {
      success: false,
      errorMsg: '用户不存在，请先注册'
    }
  }
  
  // 生成token
  const token = `user_token_${user.id}_${Date.now()}`
  
  return {
    success: true,
    data: {
      id: user.id,
      token,
      userId: user.id
    }
  }
})

/**
 * 密码登录
 */
Mock.mock('/api/user/login/password', 'post', (options) => {
  const { phone, password } = JSON.parse(options.body)
  
  // 检查手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return {
      success: false,
      errorMsg: '手机号格式不正确'
    }
  }
  
  // 查找用户
  const user = users.find(u => u.phone === phone)
  
  // 检查用户是否存在
  if (!user) {
    return {
      success: false,
      errorMsg: '用户不存在'
    }
  }
  
  // 检查密码
  if (user.password !== password) {
    return {
      success: false,
      errorMsg: '密码错误'
    }
  }
  
  // 生成token
  const token = `user_token_${user.id}_${Date.now()}`
  
  return {
    success: true,
    data: {
      id: user.id,
      token,
      userId: user.id
    }
  }
})

/**
 * 用户注册
 */
Mock.mock('/api/user/register', 'post', (options) => {
  const { phone, code, password } = JSON.parse(options.body)
  
  // 检查手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return {
      success: false,
      errorMsg: '手机号格式不正确'
    }
  }
  
  // 检查验证码
  if (!code || codeMaps[phone] !== code) {
    return {
      success: false,
      errorMsg: '验证码错误'
    }
  }
  
  // 检查密码
  if (!password || password.length < 6) {
    return {
      success: false,
      errorMsg: '密码长度不能小于6位'
    }
  }
  
  // 检查用户是否已存在
  if (users.some(u => u.phone === phone)) {
    return {
      success: false,
      errorMsg: '该手机号已注册'
    }
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    phone,
    password,
    nickName: `用户${phone.substring(7)}`,
    icon: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    city: '',
    introduce: '',
    fans: 0,
    followee: 0,
    gender: true,
    birthday: '',
    credits: 0,
    level: false
  }
  
  users.push(newUser)
  
  return {
    success: true,
    data: '注册成功'
  }
})

/**
 * 获取用户信息
 */
Mock.mock('/api/user/me', 'get', (options) => {
  
  // 从token中提取用户ID
  const userPhone = getUserPhoneFromToken()
  console.log(userPhone)

  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }

  // 查找用户
  const user = users.find(u => u.phone === userPhone)
  
  if (!user) {
    return {
      success: false,
      errorMsg: '用户不存在'
    }
  }
  
  // 返回用户信息（不包含密码）
  const { password, ...userInfo } = user
  
  return {
    success: true,
    data: userInfo
  }
})

/**
 * 更新用户基本信息
 */
Mock.mock('/api/user/update', 'put', (options) => {
  
  // 从token中提取用户ID
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  // 获取更新数据
  const { nickName, icon } = JSON.parse(options.body)
  
  // 查找用户
  const userIndex = users.findIndex(u => u.phone === userPhone)
  
  if (userIndex === -1) {
    return {
      success: false,
      errorMsg: '用户不存在'
    }
  }
  
  // 更新用户信息
  if (nickName) users[userIndex].nickName = nickName
  if (icon) users[userIndex].icon = icon
  
  return {
    success: true,
    data: '更新成功'
  }
})

/**
 * 更新用户详细信息
 */
Mock.mock('/api/user/info', 'put', (options) => {
  
  // 从token中提取用户ID
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  // 获取更新数据
  const { city, introduce, gender, birthday, email } = JSON.parse(options.body)
  
  // 查找用户
  const userIndex = users.findIndex(u => u.phone === userPhone)
  
  if (userIndex === -1) {
    return {
      success: false,
      errorMsg: '用户不存在'
    }
  }
  
  // 更新用户详细信息
  if (city !== undefined) users[userIndex].city = city
  if (introduce !== undefined) users[userIndex].introduce = introduce
  if (gender !== undefined) users[userIndex].gender = gender
  if (birthday !== undefined) users[userIndex].birthday = birthday
  if (email !== undefined) users[userIndex].email = email
  
  return {
    success: true,
    data: '更新成功'
  }
})