import Mock from 'mockjs'

// 模拟商品数据
const goods = [
  {
    id: 1,
    shopId: 1,
    name: '经典牛肉汉堡',
    price: 2800,
    originalPrice: 3200,
    description: '使用新鲜牛肉制作，搭配特制酱料和新鲜蔬菜，口感醇厚鲜美。',
    imageUrl: 'https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg',
    stock: 100,
    sold: 1024,
    skus: [
      {
        id: 1,
        name: '标准',
        price: 2800,
        stock: 50
      },
      {
        id: 2,
        name: '巨无霸',
        price: 3800,
        stock: 30
      },
      {
        id: 3,
        name: '迷你',
        price: 1800,
        stock: 20
      }
    ]
  },
  {
    id: 2,
    shopId: 1,
    name: '香辣鸡腿堡',
    price: 2500,
    originalPrice: 2800,
    description: '精选鸡腿肉，经过独特的腌制工艺和香辣酱料，口感鲜嫩多汁，辣味适中，回味悠长。',
    imageUrl: 'https://p0.meituan.net/xianfu/a7fb8043fb7d183e257a9aebc01e307b197592.jpg',
    stock: 80,
    sold: 800,
    skus: [
      {
        id: 4,
        name: '标准',
        price: 2500,
        stock: 40
      },
      {
        id: 5,
        name: '巨无霸',
        price: 3500,
        stock: 20
      },
      {
        id: 6,
        name: '迷你',
        price: 1500,
        stock: 20
      }
    ]
  },
  {
    id: 3,
    shopId: 2,
    name: '舒适大床房',
    price: 29900,
    originalPrice: 36800,
    description: '宽敞明亮的客房，配备豪华大床，舒适的寝具，设施齐全，让您拥有舒适的住宿体验。',
    imageUrl: 'https://p0.meituan.net/tdchotel/1200.0.0/5006f3926e0f93e82a2bf00a5cca391c428971.jpg',
    stock: 10,
    sold: 120,
    skus: [
      {
        id: 7,
        name: '标准房',
        price: 29900,
        stock: 5
      },
      {
        id: 8,
        name: '高级房',
        price: 39900,
        stock: 3
      },
      {
        id: 9,
        name: '豪华房',
        price: 49900,
        stock: 2
      }
    ]
  }
]

// 获取商品详情
Mock.mock(new RegExp('/api/goods/\\d+'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/goods\/(\d+)/)[1])
  const goodsItem = goods.find(item => item.id === id)
  
  if (goodsItem) {
    return {
      success: true,
      data: goodsItem
    }
  } else {
    return {
      success: false,
      errorMsg: '商品不存在'
    }
  }
})

// 获取商铺的商品列表
Mock.mock(new RegExp('/api/goods/list.*'), 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams.entries())
  
  let filteredGoods = [...goods]
  
  // 按商铺ID筛选
  if (params.shopId) {
    const shopId = parseInt(params.shopId)
    filteredGoods = filteredGoods.filter(item => item.shopId === shopId)
  }
  
  return {
    success: true,
    data: filteredGoods
  }
})

// 添加商品
Mock.mock('/api/goods', 'post', (options) => {
  const goodsData = JSON.parse(options.body)
  
  // 生成新商品ID
  const newId = goods.length > 0 ? Math.max(...goods.map(item => item.id)) + 1 : 1
  
  // 创建新商品
  const newGoods = {
    id: newId,
    ...goodsData,
    sold: 0
  }
  
  goods.push(newGoods)
  
  return {
    success: true,
    data: newId
  }
})

// 更新商品
Mock.mock('/api/goods', 'put', (options) => {
  const goodsData = JSON.parse(options.body)
  const index = goods.findIndex(item => item.id === goodsData.id)
  
  if (index !== -1) {
    // 更新商品信息
    goods[index] = {
      ...goods[index],
      ...goodsData
    }
    
    return {
      success: true,
      data: null
    }
  } else {
    return {
      success: false,
      errorMsg: '商品不存在'
    }
  }
})

// 搜索商品
Mock.mock(new RegExp('/api/goods/search.*'), 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams.entries())
  const keyword = params.keyword || ''
  
  // 过滤商品
  const filteredGoods = goods.filter(item => 
    item.name.includes(keyword) || 
    (item.description && item.description.includes(keyword))
  )
  
  // 获取商品所属商铺信息
  const results = filteredGoods.map(item => {
    // 根据shopId查找商铺信息
    const shop = Mock.Random.pick([
      { id: 1, name: '品味轩餐厅', address: '杭州市西湖区文三路478号', score: 4.8 },
      { id: 2, name: '舒适酒店', address: '杭州市滨江区江南大道102号', score: 4.7 },
      { id: 3, name: '欢乐KTV', address: '杭州市拱墅区莫干山路328号', score: 4.6 },
      { id: 4, name: '快乐外卖', address: '杭州市上城区延安路258号', score: 4.9 }
    ].filter(shop => shop.id === item.shopId))
    
    return {
      ...item,
      shopName: shop.name,
      shopAddress: shop.address,
      shopScore: shop.score
    }
  })
  
  return {
    success: true,
    data: results,
    total: results.length
  }
})

// 将模块导出以便在index.js中引入
export default {}
