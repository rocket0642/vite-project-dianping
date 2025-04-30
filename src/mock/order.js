import Mock from 'mockjs'

// 模拟订单数据
const orders = [
  {
    id: 10001,
    userId: 1,
    shopId: 1,
    goodsId: 1,
    goodsName: "经典牛肉汉堡",
    count: 2,
    goodsPrice: 2800,
    amount: 5600,
    status: 2, // 1-未支付，2-已支付，3-已取消，4-已完成
    createTime: "2023-06-15 12:00:00",
    payTime: "2023-06-15 12:05:00",
    payType: 1 // 1-微信支付，2-支付宝
  },
  {
    id: 10002,
    userId: 1,
    shopId: 2,
    goodsId: 3,
    goodsName: "舒适大床房",
    count: 1,
    goodsPrice: 29900,
    amount: 29900,
    status: 1, // 未支付
    createTime: "2023-06-16 14:30:00",
    payTime: null,
    payType: null
  }
]

// 创建订单接口
Mock.mock('/api/order/create', 'post', (options) => {
  const { body } = options
  const orderData = JSON.parse(body)
  
  // 生成新订单ID
  const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 10001
  
  // 创建新订单
  const newOrder = {
    id: newOrderId,
    userId: 1, // 假设当前用户ID为1
    ...orderData,
    status: 1, // 初始状态为未支付
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    payTime: null,
    payType: null
  }
  
  // 添加到订单列表
  orders.push(newOrder)
  
  return {
    success: true,
    data: newOrderId
  }
})

// 获取订单详情
Mock.mock(new RegExp('/api/order/status/\\d+'), 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/order\/status\/(\d+)/)[1])
  const order = orders.find(o => o.id === orderId)
  
  if (order) {
    return {
      success: true,
      data: order
    }
  } else {
    return {
      success: false,
      errorMsg: "订单不存在"
    }
  }
})

// 获取用户订单列表
Mock.mock(new RegExp('/api/order/list.*'), 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams)
  
  let filteredOrders = [...orders]
  
  // 按状态筛选
  if (params.status && params.status !== '0') {
    const status = parseInt(params.status)
    filteredOrders = filteredOrders.filter(o => o.status === status)
  }
  
  // 分页处理
  const current = parseInt(params.current) || 1
  const pageSize = 10
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const pagedOrders = filteredOrders.slice(start, end)
  
  return {
    success: true,
    data: pagedOrders,
    total: filteredOrders.length
  }
})

// 支付订单
Mock.mock(new RegExp('/api/order/pay/\\d+'), 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/order\/pay\/(\d+)/)[1])
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams)
  const payType = parseInt(params.payType) || 1
  
  const orderIndex = orders.findIndex(o => o.id === orderId)
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: "订单不存在"
    }
  }
  
  if (orders[orderIndex].status !== 1) {
    return {
      success: false,
      errorMsg: "订单状态错误，无法支付"
    }
  }
  
  // 更新订单状态
  orders[orderIndex].status = 2
  orders[orderIndex].payTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
  orders[orderIndex].payType = payType
  
  return {
    success: true,
    data: null
  }
})

// 取消订单
Mock.mock(new RegExp('/api/order/cancel/\\d+'), 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/order\/cancel\/(\d+)/)[1])
  
  const orderIndex = orders.findIndex(o => o.id === orderId)
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: "订单不存在"
    }
  }
  
  if (orders[orderIndex].status !== 1) {
    return {
      success: false,
      errorMsg: "订单已支付，无法取消"
    }
  }
  
  // 更新订单状态
  orders[orderIndex].status = 3
  
  return {
    success: true,
    data: null
  }
})

// 确认收货
Mock.mock(new RegExp('/api/order/confirm/\\d+'), 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/order\/confirm\/(\d+)/)[1])
  
  const orderIndex = orders.findIndex(o => o.id === orderId)
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: "订单不存在"
    }
  }
  
  if (orders[orderIndex].status !== 2) {
    return {
      success: false,
      errorMsg: "订单未支付或已完成，无法确认收货"
    }
  }
  
  // 更新订单状态为已完成
  orders[orderIndex].status = 4
  
  return {
    success: true,
    data: null
  }
})

export default {}
