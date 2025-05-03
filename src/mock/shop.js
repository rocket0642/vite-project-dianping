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
export const shops = [
  // 美食类
  {
    id: 1,
    name: '品味轩餐厅',
    typeId: 1,
    typeName: '美食',
    images: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
    area: '朝阳区',
    address: '北京市朝阳区建国路87号SKP商场B1层',
    x: 116.480356,
    y: 39.913486,
    avgPrice: 88,
    sold: 1024,
    comments: 968,
    score: 4.8,
    openHours: '10:00-22:00',
    distance: 1500
  },
  {
    id: 5,
    name: '江南小厨',
    typeId: 1,
    typeName: '美食',
    images: 'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg',
    area: '黄浦区',
    address: '上海市黄浦区南京东路228号新世界城6楼',
    x: 121.478765,
    y: 31.237654,
    avgPrice: 65,
    sold: 1658,
    comments: 1520,
    score: 4.6,
    openHours: '10:30-21:30',
    distance: 1200
  },
  {
    id: 6,
    name: '老板木桶饭',
    typeId: 1,
    typeName: '美食',
    images: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    area: '天河区',
    address: '广州市天河区体育西路77号',
    x: 113.327654,
    y: 23.136789,
    avgPrice: 35,
    sold: 2356,
    comments: 2127,
    score: 4.9,
    openHours: '10:00-21:00',
    distance: 900
  },

  // 酒店类
  {
    id: 2,
    name: '舒适酒店',
    typeId: 2,
    typeName: '酒店',
    images: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    area: '福田区',
    address: '深圳市福田区福华路28号',
    x: 114.067543,
    y: 22.538765,
    avgPrice: 299,
    sold: 802,
    comments: 756,
    score: 4.7,
    openHours: '14:00-12:00',
    distance: 2500
  },
  {
    id: 7,
    name: '西湖风景酒店',
    typeId: 2,
    typeName: '酒店',
    images: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    area: '锦江区',
    address: '成都市锦江区红星路三段16号',
    x: 104.083456,
    y: 30.657654,
    avgPrice: 499,
    sold: 532,
    comments: 487,
    score: 4.9,
    openHours: '全天营业',
    distance: 3200
  },
  {
    id: 8,
    name: '商务快捷酒店',
    typeId: 2,
    typeName: '酒店',
    images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    area: '武昌区',
    address: '武汉市武昌区中南路14号',
    x: 114.337654,
    y: 30.547654,
    avgPrice: 168,
    sold: 968,
    comments: 912,
    score: 4.5,
    openHours: '全天营业',
    distance: 6800
  },

  // 休闲娱乐类
  {
    id: 3,
    name: '欢乐KTV',
    typeId: 3,
    typeName: '休闲娱乐',
    images: 'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg',
    area: '玄武区',
    address: '南京市玄武区中山路18号德基广场8楼',
    x: 118.787654,
    y: 32.047654,
    avgPrice: 198,
    sold: 1256,
    comments: 1180,
    score: 4.6,
    openHours: '12:00-02:00',
    distance: 3500
  },
  {
    id: 9,
    name: '星空电影院',
    typeId: 3,
    typeName: '休闲娱乐',
    images: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
    area: '碑林区',
    address: '西安市碑林区南关正街88号',
    x: 108.937654,
    y: 34.247654,
    avgPrice: 45,
    sold: 2632,
    comments: 2510,
    score: 4.7,
    openHours: '10:00-24:00',
    distance: 7500
  },
  {
    id: 10,
    name: '音乐茶馆',
    typeId: 3,
    typeName: '休闲娱乐',
    images: 'https://images.pexels.com/photos/164758/pexels-photo-164758.jpeg',
    area: '渝中区',
    address: '重庆市渝中区解放碑民权路89号',
    x: 106.577654,
    y: 29.557654,
    avgPrice: 128,
    sold: 875,
    comments: 820,
    score: 4.8,
    openHours: '13:00-01:00',
    distance: 4800
  },

  // 外卖类
  {
    id: 4,
    name: '快乐外卖',
    typeId: 4,
    typeName: '外卖',
    images: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    area: '河西区',
    address: '天津市河西区友谊路32号',
    x: 117.217654,
    y: 39.097654,
    avgPrice: 45,
    sold: 2048,
    comments: 1890,
    score: 4.9,
    openHours: '10:00-22:00',
    distance: 800
  },
  {
    id: 11,
    name: '鲜食快递',
    typeId: 4,
    typeName: '外卖',
    images: 'https://images.pexels.com/photos/4553111/pexels-photo-4553111.jpeg',
    area: '芙蓉区',
    address: '长沙市芙蓉区黄兴中路88号',
    x: 113.007654,
    y: 28.197654,
    avgPrice: 28,
    sold: 3256,
    comments: 3012,
    score: 4.7,
    openHours: '10:00-22:00',
    distance: 1200
  },
  {
    id: 12,
    name: '家常菜外送',
    typeId: 4,
    typeName: '外卖',
    images: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    area: '鼓楼区',
    address: '福州市鼓楼区五四路128号',
    x: 119.307654,
    y: 26.097654,
    avgPrice: 38,
    sold: 2148,
    comments: 2023,
    score: 4.6,
    openHours: '09:30-22:30',
    distance: 1800
  },

  // 景点类
  {
    id: 13,
    name: '西湖游船',
    typeId: 5,
    typeName: '景点',
    images: 'https://images.pexels.com/photos/6276788/pexels-photo-6276788.jpeg',
    area: '西湖区',
    address: '杭州市西湖区湖滨路1号',
    x: 120.167654,
    y: 30.257654,
    avgPrice: 80,
    sold: 5620,
    comments: 5218,
    score: 4.9,
    openHours: '08:00-17:30',
    distance: 2200
  },
  {
    id: 14,
    name: '灵隐寺',
    typeId: 5,
    typeName: '景点',
    images: 'https://images.unsplash.com/photo-1609142621730-db3293839541',
    area: '西湖区',
    address: '杭州市西湖区法云弄1号',
    x: 120.097654,
    y: 30.247654,
    avgPrice: 45,
    sold: 9872,
    comments: 9246,
    score: 4.8,
    openHours: '07:00-18:00',
    distance: 5800
  },

  // 丽人类
  {
    id: 15,
    name: '时尚美发沙龙',
    typeId: 6,
    typeName: '丽人',
    images: 'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg',
    area: '天河区',
    address: '广州市天河区天河路208号',
    x: 113.327654,
    y: 23.137654,
    avgPrice: 198,
    sold: 1356,
    comments: 1267,
    score: 4.7,
    openHours: '10:00-22:00',
    distance: 2500
  },
  {
    id: 16,
    name: '东方SPA会所',
    typeId: 6,
    typeName: '丽人',
    images: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
    area: '静安区',
    address: '上海市静安区南京西路1266号',
    x: 121.467654,
    y: 31.237654,
    avgPrice: 328,
    sold: 868,
    comments: 817,
    score: 4.9,
    openHours: '10:00-23:00',
    distance: 3200
  },

  // 购物类
  {
    id: 17,
    name: '西湖银泰',
    typeId: 7,
    typeName: '购物',
    images: 'https://images.pexels.com/photos/273209/pexels-photo-273209.jpeg',
    area: '西湖区',
    address: '杭州市西湖区延安路98号',
    x: 120.167654,
    y: 30.257654,
    avgPrice: 500,
    sold: 12568,
    comments: 11824,
    score: 4.8,
    openHours: '10:00-22:00',
    distance: 2800
  },
  {
    id: 18,
    name: '杭州万象城',
    typeId: 7,
    typeName: '购物',
    images: 'https://images.unsplash.com/photo-1521782462922-9318be1cfd04',
    area: '江干区',
    address: '杭州市江干区富春路701号',
    x: 120.217654,
    y: 30.257654,
    avgPrice: 600,
    sold: 15632,
    comments: 14758,
    score: 4.7,
    openHours: '10:00-22:00',
    distance: 3600
  },

  // 运动健身类
  {
    id: 19,
    name: '超级健身房',
    typeId: 8,
    typeName: '运动健身',
    images: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
    area: '南山区',
    address: '深圳市南山区科技南路18号',
    x: 113.947654,
    y: 22.537654,
    avgPrice: 128,
    sold: 2865,
    comments: 2654,
    score: 4.6,
    openHours: '09:00-23:00',
    distance: 4200
  },
  {
    id: 20,
    name: '游泳健身中心',
    typeId: 8,
    typeName: '运动健身',
    images: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0',
    area: '朝阳区',
    address: '北京市朝阳区建国路93号',
    x: 116.487654,
    y: 39.917654,
    avgPrice: 158,
    sold: 1958,
    comments: 1823,
    score: 4.7,
    openHours: '09:00-22:00',
    distance: 3900
  },

  // 生活服务类
  {
    id: 21,
    name: '便民洗衣店',
    typeId: 9,
    typeName: '生活服务',
    images: 'https://images.pexels.com/photos/4488643/pexels-photo-4488643.jpeg',
    area: '海珠区',
    address: '广州市海珠区新港中路397号',
    x: 113.327654,
    y: 23.097654,
    avgPrice: 58,
    sold: 3542,
    comments: 3328,
    score: 4.8,
    openHours: '08:00-20:00',
    distance: 1800
  },
  {
    id: 22,
    name: '家政服务中心',
    typeId: 9,
    typeName: '生活服务',
    images: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957',
    area: '武侯区',
    address: '成都市武侯区人民南路四段8号',
    x: 104.077654,
    y: 30.637654,
    avgPrice: 168,
    sold: 1685,
    comments: 1562,
    score: 4.6,
    openHours: '08:30-20:30',
    distance: 4200
  },

  // 医疗健康类
  {
    id: 23,
    name: '康复理疗中心',
    typeId: 10,
    typeName: '医疗健康',
    images: 'https://images.pexels.com/photos/7088521/pexels-photo-7088521.jpeg',
    area: '福田区',
    address: '深圳市福田区福华一路88号',
    x: 114.057654,
    y: 22.537654,
    avgPrice: 298,
    sold: 1452,
    comments: 1358,
    score: 4.9,
    openHours: '09:00-21:00',
    distance: 2800
  },
  {
    id: 24,
    name: '口腔诊所',
    typeId: 10,
    typeName: '医疗健康',
    images: 'https://sghimages.shobserver.com/img/catch/2025/04/28/2d6a2023-983d-4aa3-9394-3e0319fd131b.jpg',
    area: '浦东新区',
    address: '上海市浦东新区陆家嘴环路1288号',
    x: 121.507654,
    y: 31.237654,
    avgPrice: 388,
    sold: 986,
    comments: 921,
    score: 4.7,
    openHours: '09:00-18:00',
    distance: 5200
  }
];

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
  
  // 按名称筛选 - 确保只匹配名称
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

  // 排序处理
  if (params.sortBy) {
    const sortField = params.sortBy
    const sortOrder = params.sortOrder || 'desc' // 默认降序
    
    filteredShops.sort((a, b) => {
      let result = 0
      
      // 根据不同字段排序
      switch (sortField) {
        case 'score':
          result = sortOrder === 'asc' 
            ? a.score - b.score 
            : b.score - a.score // 评分
          break
        case 'sold':
          result = sortOrder === 'asc' 
            ? a.sold - b.sold 
            : b.sold - a.sold // 销售量
          break
        case 'avgPrice':
          result = sortOrder === 'asc' 
            ? a.avgPrice - b.avgPrice 
            : b.avgPrice - a.avgPrice // 均价
          break
        default:
          result = 0
      }
      
      return result
    })
  }
  
  // 限制数量
  if (params.limit) {
    filteredShops = filteredShops.slice(0, parseInt(params.limit))
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

// 更新商铺销量
Mock.mock('/api/shop/sales', 'put', (options) => {
  const { shopId, count } = JSON.parse(options.body)
  const shop = shops.find(item => item.id === shopId)
  
  if (!shop) {
    return {
      success: false,
      errorMsg: '商铺不存在'
    }
  }
  
  // 更新商铺销量
  const newSold = shop.sold + count
  
  // 销量不能小于0
  shop.sold = newSold < 0 ? 0 : newSold
  
  return {
    success: true,
    data: { sold: shop.sold }
  }
})