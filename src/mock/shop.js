import Mock from 'mockjs'

// 商铺类型数据
const shopTypes = [
  { id: 1, name: '美食', icon: 'Food' },
  { id: 2, name: '酒店', icon: 'House' },
  { id: 3, name: '休闲娱乐', icon: 'VideoPlay' },
  { id: 4, name: '外卖', icon: 'TakeawayBox' },
  { id: 5, name: '景点', icon: 'PictureFilled' },
  { id: 6, name: '丽人', icon: 'Female' },
  { id: 7, name: '购物', icon: 'ShoppingCart' },
  { id: 8, name: '运动健身', icon: 'Football' },
  { id: 9, name: '生活服务', icon: 'Service' },
  { id: 10, name: '医疗健康', icon: 'FirstAidKit' }
]

// 模拟商铺数据
const shops = [
  {
    id: 1,
    name: '品味轩餐厅',
    typeId: 1,
    typeName: '美食',
    images: 'https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg',
    area: '西湖区',
    address: '杭州市西湖区文三路478号',
    x: 120.123456,
    y: 30.123456,
    avgPrice: 88,
    sold: 1024,
    comments: 968,
    score: 4.8,
    openHours: '10:00-22:00',
    distance: 1500
  },
  {
    id: 2,
    name: '舒适酒店',
    typeId: 2,
    typeName: '酒店',
    images: 'https://p0.meituan.net/wedding/d9dc9123ecf39c99a5ee4df9ea37fc23333192.jpg',
    area: '滨江区',
    address: '杭州市滨江区江南大道102号',
    x: 120.223456,
    y: 30.223456,
    avgPrice: 299,
    sold: 802,
    comments: 756,
    score: 4.7,
    openHours: '14:00-12:00',
    distance: 2500
  },
  {
    id: 3,
    name: '欢乐KTV',
    typeId: 3,
    typeName: '休闲娱乐',
    images: 'https://p1.meituan.net/scarlett/e8efc66f0186abf3415ec815ded58aa9377348.jpg',
    area: '拱墅区',
    address: '杭州市拱墅区莫干山路328号',
    x: 120.323456,
    y: 30.323456,
    avgPrice: 198,
    sold: 1256,
    comments: 1180,
    score: 4.6,
    openHours: '12:00-02:00',
    distance: 3500
  },
  {
    id: 4,
    name: '快乐外卖',
    typeId: 4,
    typeName: '外卖',
    images: 'https://img.meituan.net/msmerchant/87fc2032b8430a0ea6bf375c74c372e0183624.jpg',
    area: '上城区',
    address: '杭州市上城区延安路258号',
    x: 120.423456,
    y: 30.423456,
    avgPrice: 45,
    sold: 2048,
    comments: 1890,
    score: 4.9,
    openHours: '10:00-22:00',
    distance: 800
  }
]

// 获取商铺类型列表
Mock.mock('/api/shop/types', 'get', () => {
  return {
    success: true,
    data: shopTypes
  }
})

// 获取商铺详情
Mock.mock(new RegExp('/api/shop/\\d+'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/shop\/(\d+)/)[1])
  const shop = shops.find(item => item.id === id)
  
  if (shop) {
    return {
      success: true,
      data: shop
    }
  } else {
    return {
      success: false,
      errorMsg: '商铺不存在'
    }
  }
})

// 获取商铺列表
Mock.mock(new RegExp('/api/shop/list.*'), 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const params = Object.fromEntries(url.searchParams.entries())
  
  let filteredShops = [...shops]
  
  // 按名称筛选
  if (params.name) {
    filteredShops = filteredShops.filter(shop => 
      shop.name.includes(params.name)
    )
  }
  
  // 按类型筛选
  if (params.typeId) {
    const typeId = parseInt(params.typeId)
    filteredShops = filteredShops.filter(shop => shop.typeId === typeId)
  }
  
  // 按地区筛选
  if (params.area) {
    filteredShops = filteredShops.filter(shop => 
      shop.area.includes(params.area)
    )
  }
  
  // 分页处理
  const current = parseInt(params.current) || 1
  const pageSize = 10
  const start = (current - 1) * pageSize
  const end = start + pageSize
  const pagedShops = filteredShops.slice(start, end)
  
  return {
    success: true,
    data: pagedShops,
    total: filteredShops.length
  }
})