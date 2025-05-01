import Mock from 'mockjs'

// 模拟评价数据
const comments = [
  {
    id: 1,
    userPhone: '13800138000',
    shopId: 1,
    orderId: 10001,
    goodsId: 1,
    goodsName: "经典牛肉汉堡",
    content: "味道很好，服务也很周到，下次还会再来！",
    score: 5,
    images: ["https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg"],
    createTime: "2023-06-16 10:30:00",
    userNickName: "用户12345",
    userIcon: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
  },
  {
    id: 2,
    userPhone: '13800138001',
    shopId: 1,
    orderId: 10005,
    goodsId: 2,
    goodsName: "香辣鸡腿堡",
    content: "口味一般，但是服务态度很好",
    score: 4,
    images: [],
    createTime: "2023-06-15 16:45:00",
    userNickName: "美食家",
    userIcon: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
  }
]

// 提交评价
Mock.mock('/api/comment/submit', 'post', (options) => {
  const { body } = options
  const commentData = JSON.parse(body)
  
  // 生成新评价ID
  const newCommentId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1
  
  // 创建新评价
  const newComment = {
    id: newCommentId,
    ...commentData,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userNickName: "当前用户",
    userIcon: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
  }
  
  // 添加到评价列表
  comments.push(newComment)
  
  return {
    success: true,
    data: newCommentId
  }
})

// 获取店铺评价列表
Mock.mock(/\/api\/comment\/shop(\?.+)?$/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams)
  const shopId = parseInt(params.shopId)
  
  let filteredComments = comments.filter(c => c.shopId === shopId)
  
  // 分页处理
  const current = parseInt(params.current) || 1
  const pageSize = parseInt(params.pageSize) || 10
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const pagedComments = filteredComments.slice(start, end)
  
  return {
    success: true,
    data: pagedComments,
    total: filteredComments.length
  }
})

// 检查订单是否已评价
Mock.mock(new RegExp('/api/comment/check/\\d+'), 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/comment\/check\/(\d+)/)[1])
  const hasComment = comments.some(c => c.orderId === orderId)
  
  return {
    success: true,
    data: hasComment
  }
})

export default {}
