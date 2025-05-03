import Mock from 'mockjs'

// 初始化地址数据
let addresses = JSON.parse(localStorage.getItem('mock_addresses') || '[]')

// 从token获取用户
function getUserPhoneFromToken() {
  const userStore = JSON.parse(sessionStorage.getItem('user-store') || '{}')
  console.log(userStore)
  const userPhone = userStore.userPhone
  return userPhone? userPhone : ""
}

// 保存地址数据
const saveAddresses = () => {
  localStorage.setItem('mock_addresses', JSON.stringify(addresses))
}

// 获取用户地址列表
Mock.mock('/api/address/list', 'get', (options) => {
  const userPhone = getUserPhoneFromToken()
  if (!userPhone) {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  const userAddresses = addresses.filter(addr => addr.userPhone === userPhone)
  return userAddresses
})

// 添加地址
Mock.mock('/api/address/add', 'post', (options) => {
  const userPhone = getUserPhoneFromToken()
  if (!userPhone) {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  const { body } = options
  const addressData = JSON.parse(body)
  
  // 生成ID
  const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1
  
  // 创建新地址
  const newAddress = {
    id: newId,
    userPhone,
    name: addressData.name,
    phone: addressData.phone,
    address: addressData.address,
    isDefault: addressData.isDefault || false
  }
  
  // 如果新地址设为默认，将其他地址的默认设置取消
  if (newAddress.isDefault) {
    addresses.forEach(addr => {
      if (addr.userPhone === userPhone) {
        addr.isDefault = false
      }
    })
  }
  
  // 如果是用户的第一个地址，自动设为默认
  const userAddressCount = addresses.filter(addr => addr.userPhone === userPhone).length
  if (userAddressCount === 0) {
    newAddress.isDefault = true
  }
  
  addresses.push(newAddress)
  saveAddresses()
  
  return {
    success: true,
    data: newAddress
  }
})

// 更新地址
Mock.mock('/api/address/update', 'post', (options) => {
  const userPhone = getUserPhoneFromToken()
  if (!userPhone) {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  const { body } = options
  const addressData = JSON.parse(body)
  
  // 查找要更新的地址
  const index = addresses.findIndex(addr => addr.id === addressData.id && addr.userPhone === userPhone)
  
  if (index === -1) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  // 如果设为默认，将其他地址的默认设置取消
  if (addressData.isDefault) {
    addresses.forEach(addr => {
      if (addr.userPhone === userPhone) {
        addr.isDefault = false
      }
    })
  }
  
  // 更新地址
  addresses[index] = {
    ...addresses[index],
    name: addressData.name,
    phone: addressData.phone,
    address: addressData.address,
    isDefault: addressData.isDefault
  }
  
  saveAddresses()
  
  return {
    success: true,
    data: addresses[index]
  }
})

// 删除地址
Mock.mock(/\/api\/address\/delete\/\d+/, 'post', (options) => {
  const userPhone = getUserPhoneFromToken()
  if (!userPhone) {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  const id = parseInt(options.url.match(/\/api\/address\/delete\/(\d+)/)[1])
  
  // 查找要删除的地址
  const index = addresses.findIndex(addr => addr.id === id && addr.userPhone === userPhone)
  
  if (index === -1) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  const isDefault = addresses[index].isDefault
  
  // 删除地址
  addresses.splice(index, 1)
  
  // 如果删除的是默认地址且还有其他地址，设置第一个为默认
  if (isDefault) {
    const userAddresses = addresses.filter(addr => addr.userPhone === userPhone)
    if (userAddresses.length > 0) {
      userAddresses[0].isDefault = true
    }
  }
  
  saveAddresses()
  
  return {
    success: true
  }
})

// 设置默认地址
Mock.mock(/\/api\/address\/set-default\/\d+/, 'post', (options) => {
  const userPhone = getUserPhoneFromToken()
  if (!userPhone) {
    return {
      success: false,
      errorMsg: '未登录'
    }
  }
  
  const id = parseInt(options.url.match(/\/api\/address\/set-default\/(\d+)/)[1])
  
  // 查找要设为默认的地址
  const address = addresses.find(addr => addr.id === id && addr.userPhone === userPhone)
  
  if (!address) {
    return {
      success: false,
      errorMsg: '地址不存在'
    }
  }
  
  // 取消其他默认地址
  addresses.forEach(addr => {
    if (addr.userPhone === userPhone) {
      addr.isDefault = addr.id === id
    }
  })
  
  saveAddresses()
  
  return {
    success: true
  }
})

export default addresses