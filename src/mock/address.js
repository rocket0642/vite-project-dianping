import Mock from 'mockjs'

// 模拟用户地址数据
let addresses = [
  {
    id: 1,
    userPhone: '13800138000',
    name: '张三',
    phone: '13800138000',
    address: '浙江省杭州市西湖区文三路 100 号',
    isDefault: true
  },
  {
    id: 2,
    userPhone: '13800138001',
    name: '李四',
    phone: '13800138001',
    address: '浙江省杭州市滨江区江南大道 200 号',
    isDefault: false
  },
  {
    id: 3,
    userPhone: '13800138002',
    name: '王五',
    phone: '13800138002',
    address: '浙江省杭州市余杭区五常街道 300 号',
    isDefault: false
  }
]

// 从token中统一获取userPhone的辅助函数
function getUserPhoneFromToken() {
  const userStore = JSON.parse(localStorage.getItem('user-store') || '{}')
  console.log(userStore)
  const userPhone = userStore.userPhone
  return userPhone? userPhone : ""
}

/**
 * 获取用户地址列表
 */
Mock.mock('/api/user/address/list', 'get', (options) => {
  
  // 从token中提取用户
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  

  // 过滤出用户的地址
  const userAddresses = addresses.filter(addr => addr.userPhone === userPhone)
  
  return {
    success: true,
    data: userAddresses
  }
})

/**
 * 添加用户地址
 */
Mock.mock('/api/user/address/add', 'post', (options) => {
  
  // 从token中提取用户
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  const { name, phone, address, isDefault } = JSON.parse(options.body)
  
  // 验证必填字段
  if (!name || !phone || !address) {
    return {
      success: false,
      errorMsg: '姓名、电话和地址不能为空'
    }
  }
  
  // 如果设置为默认地址，需要将其他地址设为非默认
  if (isDefault) {
    addresses.forEach(addr => {
      if (addr.userPhone === userPhone) {
        addr.isDefault = false
      }
    })
  }
  
  // 创建新地址，确保包含userPhone
  const newAddress = {
    id: addresses.length + 1,
    userPhone,
    name,
    phone,
    address,
    isDefault: isDefault || false
  }
  
  addresses.push(newAddress)
  
  return {
    success: true,
    data: newAddress
  }
})

/**
 * 更新用户地址
 */
Mock.mock('/api/user/address/update', 'put', (options) => {
  
  // 从token中提取用户
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  const { id, name, phone, address, isDefault } = JSON.parse(options.body)
  
  // 验证必填字段
  if (!id || !name || !phone || !address) {
    return {
      success: false,
      errorMsg: '地址ID、姓名、电话和地址不能为空'
    }
  }
  
  // 查找地址
  const addressIndex = addresses.findIndex(addr => addr.id === id && addr.userPhone === userPhone)
  
  if (addressIndex === -1) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  // 如果设置为默认地址，需要将其他地址设为非默认
  if (isDefault) {
    addresses.forEach(addr => {
      if (addr.userPhone === userPhone) {
        addr.isDefault = false
      }
    })
  }
  
  // 更新地址
  addresses[addressIndex] = {
    ...addresses[addressIndex],
    name,
    phone,
    address,
    isDefault: isDefault || false
  }
  
  return {
    success: true,
    data: addresses[addressIndex]
  }
})

/**
 * 删除用户地址
 */
Mock.mock(new RegExp('/api/user/address/delete/\\d+'), 'delete', (options) => {
  
  // 从token中提取用户
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  // 从URL中提取地址ID
  const id = parseInt(options.url.match(/\/delete\/(\d+)/)[1])
  
  // 查找地址
  const addressIndex = addresses.findIndex(addr => addr.id === id && addr.userPhone === userPhone)
  
  if (addressIndex === -1) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  // 如果删除的是默认地址，需要将第一个地址设为默认
  if (addresses[addressIndex].isDefault) {
    const otherAddresses = addresses.filter(addr => addr.userPhone === userPhone && addr.id !== id)
    if (otherAddresses.length > 0) {
      otherAddresses[0].isDefault = true
    }
  }
  
  // 删除地址
  addresses.splice(addressIndex, 1)
  
  return {
    success: true,
    data: '删除成功'
  }
})

/**
 * 设置默认地址
 */
Mock.mock(new RegExp('/api/user/address/default/\\d+'), 'put', (options) => {
  
  // 从token中提取用户
  const userPhone = getUserPhoneFromToken()
  
  if (userPhone === "") {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  // 从URL中提取地址ID
  const id = parseInt(options.url.match(/\/default\/(\d+)/)[1])
  
  // 查找地址
  const addressIndex = addresses.findIndex(addr => addr.id === id && addr.userPhone === userPhone)
  
  if (addressIndex === -1) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  // 将其他地址设为非默认
  addresses.forEach(addr => {
    if (addr.userPhone === userPhone) {
      addr.isDefault = false
    }
  })
  
  // 设置默认地址
  addresses[addressIndex].isDefault = true
  
  return {
    success: true,
    data: addresses[addressIndex]
  }
})