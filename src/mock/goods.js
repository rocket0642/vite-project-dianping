import Mock from 'mockjs'
// 导入商铺数据，确保商品能关联到真实商铺
import { shops } from './shop'

// 模拟商品数据
const goods = [
  {
    id: 1, shopId: 1, name: '东坡肉套餐',
    price: 6800, originalPrice: 8800,
    description: '传统杭帮菜代表作，选用三层五花肉慢火炖制4小时',
    imageUrl: 'https://images.pexels.com/photos/718742/pexels-photo-718742.jpeg',
    stock: 50, sold: 324,
    skus: [
      { id: 101, name: '单人餐', price: 6800, stock: 30 },
      { id: 102, name: '双人餐', price: 12800, stock: 15 },
      { id: 103, name: '家庭餐', price: 18800, stock: 5 }
    ]
  },
  {
    id: 2, shopId: 1, name: '龙井虾仁',
    price: 9800, originalPrice: 12800,
    description: '新鲜河虾仁搭配特级龙井茶叶爆炒',
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979',
    stock: 40, sold: 215,
    skus: [
      { id: 104, name: '标准份', price: 9800, stock: 25 },
      { id: 105, name: '大份', price: 14800, stock: 10 },
      { id: 106, name: '精品套餐', price: 19800, stock: 5 }
    ]
  },
  {
    id: 3, shopId: 1, name: '宋嫂鱼羹',
    price: 3800, originalPrice: 4800,
    description: '传统南宋风味鱼羹，鳜鱼熬制汤底',
    imageUrl: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg',
    stock: 60, sold: 158,
    skus: [
      { id: 107, name: '小碗', price: 3800, stock: 40 },
      { id: 108, name: '大碗', price: 5800, stock: 15 },
      { id: 109, name: '精品装', price: 8800, stock: 5 }
    ]
  },
  {
    id: 4, shopId: 1, name: '西湖醋鱼',
    price: 8800, originalPrice: 10800,
    description: '选用西湖草鱼，传统糖醋汁勾芡',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    stock: 35, sold: 89,
    skus: [
      { id: 110, name: '标准份', price: 8800, stock: 20 },
      { id: 111, name: '精品套餐', price: 15800, stock: 10 },
      { id: 112, name: '宴会装', price: 25800, stock: 5 }
    ]
  },
  {
    id: 5, shopId: 1, name: '蟹粉小笼包',
    price: 2800, originalPrice: 3800,
    description: '现拆蟹粉搭配鲜肉，皮薄汁多',
    imageUrl: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg',
    stock: 100, sold: 456,
    skus: [
      { id: 113, name: '4只装', price: 2800, stock: 60 },
      { id: 114, name: '8只装', price: 4800, stock: 30 },
      { id: 115, name: '12只装', price: 6800, stock: 10 }
    ]
  },
  {
    id: 6, shopId: 1, name: '杭州片儿川',
    price: 2200, originalPrice: 2800,
    description: '传统杭式汤面，雪菜笋片肉片浇头',
    imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
    stock: 80, sold: 287,
    skus: [
      { id: 116, name: '标准碗', price: 2200, stock: 50 },
      { id: 117, name: '加量版', price: 3200, stock: 25 },
      { id: 118, name: '全家福', price: 4200, stock: 5 }
    ]
  },
  {
    id: 7, shopId: 1, name: '干炸响铃',
    price: 1800, originalPrice: 2500,
    description: '豆腐皮包裹肉馅油炸，酥脆可口',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    stock: 120, sold: 632,
    skus: [
      { id: 119, name: '6个装', price: 1800, stock: 80 },
      { id: 120, name: '12个装', price: 3200, stock: 30 },
      { id: 121, name: '24个装', price: 5800, stock: 10 }
    ]
  },
  {
    id: 8, shopId: 1, name: '定胜糕礼盒',
    price: 4800, originalPrice: 6800,
    description: '传统米制糕点，吉祥寓意',
    imageUrl: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    stock: 45, sold: 78,
    skus: [
      { id: 122, name: '6枚装', price: 4800, stock: 30 },
      { id: 123, name: '12枚装', price: 8800, stock: 12 },
      { id: 124, name: '豪华礼盒', price: 12800, stock: 3 }
    ]
  },
  {
    id: 9, shopId: 1, name: '杭式卤鸭',
    price: 5800, originalPrice: 7800,
    description: '文火慢卤的酱香鸭肉',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    stock: 30, sold: 45,
    skus: [
      { id: 125, name: '半只', price: 5800, stock: 20 },
      { id: 126, name: '整只', price: 10800, stock: 8 },
      { id: 127, name: '礼品装', price: 15800, stock: 2 }
    ]
  },
  {
    id: 10, shopId: 1, name: '桂花糖藕',
    price: 2800, originalPrice: 3800,
    description: '糯米藕段淋桂花糖汁',
    imageUrl: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    stock: 65, sold: 123,
    skus: [
      { id: 128, name: '4片装', price: 2800, stock: 40 },
      { id: 129, name: '8片装', price: 4800, stock: 20 },
      { id: 130, name: '礼盒装', price: 6800, stock: 5 }
    ]
  },
  {
    id: 501,
    shopId: 5,
    name: '蟹粉狮子头',
    price: 6800,
    originalPrice: 8800,
    description: '传统扬州名菜，手工摔打肉丸嵌入蟹粉',
    imageUrl: 'https://images.pexels.com/photos/1192031/pexels-photo-1192031.jpeg',
    stock: 45,
    sold: 238,
    skus: [
      { id: 50101, name: '单颗装', price: 6800, stock: 30 },
      { id: 50102, name: '双人套餐', price: 12800, stock: 12 },
      { id: 50103, name: '四喜礼盒', price: 22800, stock: 3 }
    ]
  },
  {
    id: 502,
    shopId: 5,
    name: '黄酒焖河鳗',
    price: 15800,
    originalPrice: 19800,
    description: '绍兴黄酒慢火煨制钱塘江河鳗',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
    stock: 25,
    sold: 89,
    skus: [
      { id: 50201, name: '小份', price: 15800, stock: 15 },
      { id: 50202, name: '中份', price: 22800, stock: 8 },
      { id: 50203, name: '宴席装', price: 35800, stock: 2 }
    ]
  },
  {
    id: 503,
    shopId: 5,
    name: '桂花糖藕',
    price: 2800,
    originalPrice: 3800,
    description: '糯米灌藕配桂花蜜汁，冷热两吃',
    imageUrl: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    stock: 60,
    sold: 156,
    skus: [
      { id: 50301, name: '4片装', price: 2800, stock: 40 },
      { id: 50302, name: '8片礼盒', price: 4800, stock: 18 },
      { id: 50303, name: '16片豪华装', price: 8800, stock: 2 }
    ]
  },
  {
    id: 504,
    shopId: 5,
    name: '清蒸鲥鱼',
    price: 18800,
    originalPrice: 25800,
    description: '长江鲥鱼配火腿春笋清蒸，保留鳞片油脂',
    imageUrl: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg',
    stock: 15,
    sold: 32,
    skus: [
      { id: 50401, name: '半条', price: 18800, stock: 10 },
      { id: 50402, name: '整条', price: 32800, stock: 5 }
    ]
  },
  {
    id: 505,
    shopId: 5,
    name: '腌笃鲜砂锅',
    price: 7800,
    originalPrice: 9800,
    description: '咸肉鲜肉春笋文火慢炖，江南春季限定',
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979',
    stock: 35,
    sold: 67,
    skus: [
      { id: 50501, name: '小锅', price: 7800, stock: 20 },
      { id: 50502, name: '中锅', price: 11800, stock: 12 },
      { id: 50503, name: '家庭锅', price: 16800, stock: 3 }
    ]
  },
  {
    id: 506,
    shopId: 5,
    name: '龙井茶香鸡',
    price: 9800,
    originalPrice: 12800,
    description: '童子鸡用龙井茶叶熏制，茶香四溢',
    imageUrl: 'https://images.pexels.com/photos/718742/pexels-photo-718742.jpeg',
    stock: 28,
    sold: 43,
    skus: [
      { id: 50601, name: '半只', price: 9800, stock: 18 },
      { id: 50602, name: '整只', price: 16800, stock: 8 },
      { id: 50603, name: '礼盒装', price: 22800, stock: 2 }
    ]
  },

  {
    id: 601,
    shopId: 6,
    name: '招牌腊味木桶饭',
    price: 3200,
    originalPrice: 3800,
    description: '广式腊肠+湘西腊肉双拼，搭配秘制酱汁',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    stock: 120,
    sold: 856,
    skus: [
      { id: 60101, name: '标准份', price: 3200, stock: 80 },
      { id: 60102, name: '加量版', price: 4200, stock: 35 },
      { id: 60103, name: '套餐（含汤）', price: 4800, stock: 5 }
    ]
  },
  {
    id: 602,
    shopId: 6,
    name: '香辣牛肉木桶饭',
    price: 3500,
    originalPrice: 4200,
    description: '嫩牛肉片配特制辣酱，可选辣度',
    imageUrl: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg',
    stock: 95,
    sold: 723,
    skus: [
      { id: 60201, name: '微辣', price: 3500, stock: 50 },
      { id: 60202, name: '中辣', price: 3500, stock: 35 },
      { id: 60203, name: '特辣', price: 3800, stock: 10 }
    ]
  },
  {
    id: 603,
    shopId: 6,
    name: '香菇滑鸡木桶饭',
    price: 2800,
    originalPrice: 3500,
    description: '鸡腿肉+新鲜香菇，酱香口味',
    imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    stock: 150,
    sold: 642,
    skus: [
      { id: 60301, name: '标准份', price: 2800, stock: 100 },
      { id: 60302, name: '加鸡腿', price: 3800, stock: 45 },
      { id: 60303, name: '儿童餐', price: 2200, stock: 5 }
    ]
  },
  {
    id: 604,
    shopId: 6,
    name: '酸豆角肉末木桶饭',
    price: 2500,
    originalPrice: 3000,
    description: '自制酸豆角+猪肉末，开胃首选',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    stock: 180,
    sold: 587,
    skus: [
      { id: 60401, name: '标准份', price: 2500, stock: 120 },
      { id: 60402, name: '加蛋版', price: 3000, stock: 55 },
      { id: 60403, name: '大胃王套餐', price: 4500, stock: 5 }
    ]
  },
  {
    id: 605,
    shopId: 6,
    name: '黑椒牛排木桶饭',
    price: 4500,
    originalPrice: 5500,
    description: '原切牛排+黑椒汁，赠送溏心蛋',
    imageUrl: 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg',
    stock: 65,
    sold: 328,
    skus: [
      { id: 60501, name: '标准份', price: 4500, stock: 40 },
      { id: 60502, name: '双拼（牛+鸡）', price: 5800, stock: 20 },
      { id: 60503, name: '豪华套餐', price: 6800, stock: 5 }
    ]
  },
  {
    id: 606,
    shopId: 6,
    name: '素食田园木桶饭',
    price: 2200,
    originalPrice: 2800,
    description: '时令蔬菜+菌菇+豆腐，健康之选',
    imageUrl: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
    stock: 200,
    sold: 415,
    skus: [
      { id: 60601, name: '标准份', price: 2200, stock: 150 },
      { id: 60602, name: '加菌菇', price: 3000, stock: 45 },
      { id: 60603, name: '全素套餐', price: 3800, stock: 5 }
    ]
  },


  {
    id: 201,
    shopId: 2,
    name: '豪华大床房',
    price: 39900,
    originalPrice: 49900,
    description: '32㎡全景落地窗，配备智能家居系统',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    stock: 15,
    sold: 128,
    skus: [
      { id: 20101, name: '无早', price: 39900, stock: 8 },
      { id: 20102, name: '含双早', price: 45900, stock: 6 },
      { id: 20103, name: '行政礼遇', price: 59900, stock: 1 }
    ]
  },
  {
    id: 202,
    shopId: 2,
    name: '会议全日套餐',
    price: 188800,
    originalPrice: 258800,
    description: '含20人会议室8小时+茶歇3次',
    imageUrl: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
    stock: 5,
    sold: 23,
    skus: [
      { id: 20201, name: '基础设备', price: 188800, stock: 3 },
      { id: 20202, name: '含投影仪', price: 218800, stock: 2 }
    ]
  },
  {
    id: 203,
    shopId: 2,
    name: '周末staycation套餐',
    price: 68800,
    originalPrice: 88800,
    description: '大床房1晚+双人下午茶+延迟退房至16点',
    imageUrl: 'https://images.unsplash.com/photo-1539667468225-eebb663053e6',
    stock: 10,
    sold: 45,
    skus: [
      { id: 20301, name: '周五入住', price: 68800, stock: 4 },
      { id: 20302, name: '周六入住', price: 78800, stock: 6 }
    ]
  },
  {
    id: 204,
    shopId: 2,
    name: '月租商务房',
    price: 599000,
    originalPrice: 799000,
    description: '连续入住30天，每日保洁服务',
    imageUrl: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    stock: 3,
    sold: 7,
    skus: [
      { id: 20401, name: '大床房', price: 599000, stock: 2 },
      { id: 20402, name: '双床房', price: 629000, stock: 1 }
    ]
  },
  {
    id: 205,
    shopId: 2,
    name: '机场接送套餐',
    price: 12800,
    originalPrice: 18800,
    description: '专车接送机服务（萧山机场范围内）',
    imageUrl: 'https://images.pexels.com/photos/241316/pexels-photo-241316.jpeg',
    stock: 20,
    sold: 32,
    skus: [
      { id: 20501, name: '经济型轿车', price: 12800, stock: 15 },
      { id: 20502, name: '商务车', price: 19800, stock: 5 }
    ]
  },
  {
    id: 206,
    shopId: 2,
    name: '健身中心季卡',
    price: 38800,
    originalPrice: 58800,
    description: '三个月无限次使用健身中心+泳池',
    imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    stock: 12,
    sold: 18,
    skus: [
      { id: 20601, name: '个人卡', price: 38800, stock: 10 },
      { id: 20602, name: '双人卡', price: 68800, stock: 2 }
    ]
  },


  {
    id: 701,
    shopId: 7,
    name: '湖景套房',
    price: 129900,
    originalPrice: 159900,
    description: '68㎡全景套房，阳台直面西湖',
    imageUrl: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    stock: 6,
    sold: 24,
    skus: [
      { id: 70101, name: '园景房', price: 89900, stock: 4 },
      { id: 70102, name: '湖景房', price: 129900, stock: 2 }
    ]
  },
  {
    id: 702,
    shopId: 7,
    name: '游船早餐套餐',
    price: 48800,
    originalPrice: 68800,
    description: '含西湖游船票+船上定制早餐',
    imageUrl: 'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg',
    stock: 8,
    sold: 15,
    skus: [
      { id: 70201, name: '中式早餐', price: 48800, stock: 6 },
      { id: 70202, name: '西式早餐', price: 52800, stock: 2 }
    ]
  },
  {
    id: 703,
    shopId: 7,
    name: '湖畔婚礼套餐',
    price: 888800,
    originalPrice: 1288800,
    description: '含场地布置+50人餐饮+摄影服务',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
    stock: 2,
    sold: 3,
    skus: [
      { id: 70301, name: '春季档', price: 888800, stock: 1 },
      { id: 70302, name: '秋季档', price: 988800, stock: 1 }
    ]
  },
  {
    id: 704,
    shopId: 7,
    name: '茶文化体验',
    price: 18800,
    originalPrice: 28800,
    description: '龙井茶园参观+炒茶体验+品鉴会',
    imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    stock: 15,
    sold: 28,
    skus: [
      { id: 70401, name: '基础体验', price: 18800, stock: 12 },
      { id: 70402, name: '含伴手礼', price: 25800, stock: 3 }
    ]
  },
  {
    id: 705,
    shopId: 7,
    name: '亲子度假套餐',
    price: 158800,
    originalPrice: 208800,
    description: '2大1小入住+儿童乐园通票+亲子活动',
    imageUrl: 'https://images.pexels.com/photos/2253879/pexels-photo-2253879.jpeg',
    stock: 5,
    sold: 12,
    skus: [
      { id: 70501, name: '平日价', price: 158800, stock: 3 },
      { id: 70502, name: '周末价', price: 178800, stock: 2 }
    ]
  },
  {
    id: 706,
    shopId: 7,
    name: 'SPA水疗套餐',
    price: 58800,
    originalPrice: 88800,
    description: '90分钟全身精油SPA+私汤体验',
    imageUrl: 'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
    stock: 8,
    sold: 16,
    skus: [
      { id: 70601, name: '单人套餐', price: 58800, stock: 6 },
      { id: 70602, name: '双人套餐', price: 98800, stock: 2 }
    ]
  },


  {
    id: 801,
    shopId: 8,
    name: '特惠钟点房',
    price: 9800,
    originalPrice: 12800,
    description: '4小时入住，适合临时休息',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    stock: 20,
    sold: 156,
    skus: [
      { id: 80101, name: '白天场', price: 9800, stock: 15 },
      { id: 80102, name: '午夜场', price: 12800, stock: 5 }
    ]
  },
  {
    id: 802,
    shopId: 8,
    name: '长租优惠房',
    price: 199000,
    originalPrice: 259000,
    description: '连续入住30天，含每周3次保洁',
    imageUrl: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
    stock: 6,
    sold: 9,
    skus: [
      { id: 80201, name: '大床房', price: 199000, stock: 4 },
      { id: 80202, name: '双床房', price: 219000, stock: 2 }
    ]
  },
  {
    id: 803,
    shopId: 8,
    name: '机场接送套餐',
    price: 19800,
    originalPrice: 25800,
    description: '专车接送机（萧山机场/火车东站）',
    imageUrl: 'https://images.pexels.com/photos/1489335/pexels-photo-1489335.jpeg',
    stock: 15,
    sold: 42,
    skus: [
      { id: 80301, name: '5座轿车', price: 19800, stock: 12 },
      { id: 80302, name: '7座商务', price: 25800, stock: 3 }
    ]
  },
  {
    id: 804,
    shopId: 8,
    name: '学生特惠房',
    price: 15800,
    originalPrice: 19800,
    description: '凭学生证享特价，含早餐',
    imageUrl: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg',
    stock: 12,
    sold: 38,
    skus: [
      { id: 80401, name: '平日价', price: 15800, stock: 10 },
      { id: 80402, name: '周末价', price: 17800, stock: 2 }
    ]
  },
  {
    id: 805,
    shopId: 8,
    name: '凌晨安心住',
    price: 12800,
    originalPrice: 16800,
    description: '凌晨0-6点入住，次日14点退房',
    imageUrl: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
    stock: 18,
    sold: 67,
    skus: [
      { id: 80501, name: '大床房', price: 12800, stock: 15 },
      { id: 80502, name: '双床房', price: 14800, stock: 3 }
    ]
  },
  {
    id: 806,
    shopId: 8,
    name: '行李寄存套餐',
    price: 1800,
    originalPrice: 2800,
    description: '24小时行李保管+免费包装服务',
    imageUrl: 'https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg',
    stock: 50,
    sold: 213,
    skus: [
      { id: 80601, name: '小件行李', price: 1800, stock: 40 },
      { id: 80602, name: '大件行李', price: 2800, stock: 10 }
    ]
  },

  {
    id: 301,
    shopId: 3,
    name: '黄金时段欢唱套餐',
    price: 19800,
    originalPrice: 29800,
    description: '中包间3小时+果盘+饮料无限续杯（19:00-24:00）',
    imageUrl: 'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg',
    stock: 15,
    sold: 132,
    skus: [
      { id: 30101, name: '工作日', price: 19800, stock: 10 },
      { id: 30102, name: '周末', price: 25800, stock: 5 }
    ]
  },
  {
    id: 302,
    shopId: 3,
    name: '通宵狂欢套餐',
    price: 38800,
    originalPrice: 58800,
    description: '大包间8小时（23:00-7:00）+啤酒半打',
    imageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    stock: 8,
    sold: 45,
    skus: [
      { id: 30201, name: '普通包', price: 38800, stock: 6 },
      { id: 30202, name: 'VIP包', price: 48800, stock: 2 }
    ]
  },
  {
    id: 303,
    shopId: 3,
    name: '生日派对套餐',
    price: 58800,
    originalPrice: 88800,
    description: 'VIP包厢4小时+主题布置+生日蛋糕',
    imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
    stock: 5,
    sold: 23,
    skus: [
      { id: 30301, name: '基础款', price: 58800, stock: 3 },
      { id: 30302, name: '豪华款', price: 78800, stock: 2 }
    ]
  },
  {
    id: 304,
    shopId: 3,
    name: '商务酒水套餐',
    price: 28800,
    originalPrice: 38800,
    description: '中包2小时+洋酒1瓶+小吃拼盘',
    imageUrl: 'https://images.pexels.com/photos/1267350/pexels-photo-1267350.jpeg',
    stock: 12,
    sold: 38,
    skus: [
      { id: 30401, name: '威士忌套餐', price: 28800, stock: 8 },
      { id: 30402, name: '白兰地套餐', price: 32800, stock: 4 }
    ]
  },
  {
    id: 305,
    shopId: 3,
    name: '学生特惠包',
    price: 9800,
    originalPrice: 15800,
    description: '小包间2小时（14:00-18:00，凭学生证）',
    imageUrl: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
    stock: 20,
    sold: 87,
    skus: [
      { id: 30501, name: '平日场', price: 9800, stock: 15 },
      { id: 30502, name: '周末场', price: 12800, stock: 5 }
    ]
  },
  {
    id: 306,
    shopId: 3,
    name: '情侣迷你包',
    price: 12800,
    originalPrice: 18800,
    description: '情侣主题包间2小时+双人饮品',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
    stock: 10,
    sold: 42,
    skus: [
      { id: 30601, name: '基础款', price: 12800, stock: 8 },
      { id: 30602, name: '浪漫款', price: 16800, stock: 2 }
    ]
  },
  {
    id: 307,
    shopId: 3,
    name: '公司团建套餐',
    price: 88800,
    originalPrice: 128800,
    description: '超大包间6小时+自助餐+专业音响设备',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    stock: 3,
    sold: 12,
    skus: [
      { id: 30701, name: '20人套餐', price: 88800, stock: 2 },
      { id: 30702, name: '30人套餐', price: 108800, stock: 1 }
    ]
  },
  {
    id: 308,
    shopId: 3,
    name: '下午茶欢唱套餐',
    price: 12800,
    originalPrice: 18800,
    description: '小包间3小时（14:00-18:00）+精致茶点',
    imageUrl: 'https://images.pexels.com/photos/405238/pexels-photo-405238.jpeg',
    stock: 18,
    sold: 65,
    skus: [
      { id: 30801, name: '2人套餐', price: 12800, stock: 12 },
      { id: 30802, name: '4人套餐', price: 18800, stock: 6 }
    ]
  },

  {
    id: 901,
    shopId: 9,
    name: 'IMAX激光厅套餐',
    price: 9800,
    originalPrice: 12800,
    description: 'IMAX影票1张+爆米花套餐',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
    stock: 50,
    sold: 328,
    skus: [
      { id: 90101, name: '普通场', price: 9800, stock: 35 },
      { id: 90102, name: '黄金场', price: 11800, stock: 15 }
    ]
  },
  {
    id: 902,
    shopId: 9,
    name: '情侣沙发座套餐',
    price: 25800,
    originalPrice: 35800,
    description: '双人VIP沙发座+情侣饮品套餐',
    imageUrl: 'https://images.pexels.com/photos/3758899/pexels-photo-3758899.jpeg',
    stock: 12,
    sold: 45,
    skus: [
      { id: 90201, name: '日场', price: 25800, stock: 8 },
      { id: 90202, name: '夜场', price: 28800, stock: 4 }
    ]
  },
  {
    id: 903,
    shopId: 9,
    name: '儿童动画专场',
    price: 6800,
    originalPrice: 8800,
    description: '儿童票+卡通爆米花桶+玩具礼物',
    imageUrl: 'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg',
    stock: 30,
    sold: 78,
    skus: [
      { id: 90301, name: '单儿童', price: 6800, stock: 25 },
      { id: 90302, name: '1大1小', price: 9800, stock: 5 }
    ]
  },
  {
    id: 904,
    shopId: 9,
    name: '午夜惊悚片专场',
    price: 8800,
    originalPrice: 10800,
    description: '23:00-01:00限定场次+恐怖主题饮料',
    imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
    stock: 15,
    sold: 42,
    skus: [
      { id: 90401, name: '普通票', price: 8800, stock: 12 },
      { id: 90402, name: '尖叫套餐', price: 12800, stock: 3 }
    ]
  },
  {
    id: 905,
    shopId: 9,
    name: '电影主题生日派对',
    price: 58800,
    originalPrice: 78800,
    description: '私人放映厅+定制片头祝福+10人观影',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
    stock: 5,
    sold: 8,
    skus: [
      { id: 90501, name: '动画主题', price: 58800, stock: 3 },
      { id: 90502, name: '漫威主题', price: 68800, stock: 2 }
    ]
  },
  {
    id: 906,
    shopId: 9,
    name: '艺术电影沙龙',
    price: 15800,
    originalPrice: 19800,
    description: '小众艺术片+导演交流会+限量手册',
    imageUrl: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg',
    stock: 20,
    sold: 15,
    skus: [
      { id: 90601, name: '标准票', price: 15800, stock: 15 },
      { id: 90602, name: 'VIP票', price: 21800, stock: 5 }
    ]
  },
  {
    id: 907,
    shopId: 9,
    name: '电影马拉松套餐',
    price: 38800,
    originalPrice: 48800,
    description: '连续观看3部系列电影+专属休息区',
    imageUrl: 'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg',
    stock: 8,
    sold: 12,
    skus: [
      { id: 90701, name: '日间场', price: 38800, stock: 6 },
      { id: 90702, name: '通宵场', price: 42800, stock: 2 }
    ]
  },
  {
    id: 908,
    shopId: 9,
    name: '老年人怀旧专场',
    price: 4800,
    originalPrice: 6800,
    description: '经典老电影+免费茶水（60岁以上）',
    imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
    stock: 25,
    sold: 18,
    skus: [
      { id: 90801, name: '单人票', price: 4800, stock: 20 },
      { id: 90802, name: '夫妻票', price: 7800, stock: 5 }
    ]
  },

  {
    id: 1001,
    shopId: 10,
    name: '民谣之夜套餐',
    price: 12800,
    originalPrice: 16800,
    description: '晚间民谣演出+特调茶饮',
    imageUrl: 'https://images.pexels.com/photos/164758/pexels-photo-164758.jpeg',
    stock: 15,
    sold: 42,
    skus: [
      { id: 100101, name: '普通座', price: 12800, stock: 12 },
      { id: 100102, name: 'VIP座', price: 16800, stock: 3 }
    ]
  },
  {
    id: 1002,
    shopId: 10,
    name: '茶道体验课',
    price: 8800,
    originalPrice: 10800,
    description: '90分钟专业茶艺师指导+三款名茶品鉴',
    imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    stock: 10,
    sold: 23,
    skus: [
      { id: 100201, name: '单人体验', price: 8800, stock: 8 },
      { id: 100202, name: '双人体验', price: 15800, stock: 2 }
    ]
  },
  {
    id: 1003,
    shopId: 10,
    name: '古琴雅集',
    price: 15800,
    originalPrice: 19800,
    description: '古琴演奏会+限量版茶点',
    imageUrl: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg',
    stock: 8,
    sold: 15,
    skus: [
      { id: 100301, name: '普通票', price: 15800, stock: 6 },
      { id: 100302, name: '前排票', price: 19800, stock: 2 }
    ]
  },
  {
    id: 1004,
    shopId: 10,
    name: '文人茶席',
    price: 22800,
    originalPrice: 28800,
    description: '私密包间+宋代点茶表演+手工茶食',
    imageUrl: 'https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg',
    stock: 5,
    sold: 8,
    skus: [
      { id: 100401, name: '2人席', price: 22800, stock: 3 },
      { id: 100402, name: '4人席', price: 38800, stock: 2 }
    ]
  },
  {
    id: 1005,
    shopId: 10,
    name: '周末读书会',
    price: 6800,
    originalPrice: 8800,
    description: '主题书籍分享+无限续杯茶饮',
    imageUrl: 'https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg',
    stock: 20,
    sold: 32,
    skus: [
      { id: 100501, name: '上午场', price: 6800, stock: 15 },
      { id: 100502, name: '下午场', price: 7800, stock: 5 }
    ]
  },
  {
    id: 1006,
    shopId: 10,
    name: '茶香手工课',
    price: 12800,
    originalPrice: 15800,
    description: '茶叶香囊制作+茶染布艺体验',
    imageUrl: 'https://images.pexels.com/photos/6344235/pexels-photo-6344235.jpeg',
    stock: 12,
    sold: 18,
    skus: [
      { id: 100601, name: '基础课', price: 12800, stock: 10 },
      { id: 100602, name: '精品课', price: 16800, stock: 2 }
    ]
  },
  {
    id: 1007,
    shopId: 10,
    name: '二十四节气茶宴',
    price: 38800,
    originalPrice: 48800,
    description: '当季节气主题茶餐搭配讲解',
    imageUrl: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg',
    stock: 6,
    sold: 9,
    skus: [
      { id: 100701, name: '春季节气', price: 38800, stock: 4 },
      { id: 100702, name: '秋季节气', price: 42800, stock: 2 }
    ]
  },
  {
    id: 1008,
    shopId: 10,
    name: '深夜茶书房',
    price: 5800,
    originalPrice: 7800,
    description: '23:00-02:00静心阅读空间+安神茶',
    imageUrl: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg',
    stock: 25,
    sold: 38,
    skus: [
      { id: 100801, name: '普通位', price: 5800, stock: 20 },
      { id: 100802, name: '窗景位', price: 7800, stock: 5 }
    ]
  },

  {
    id: 401,
    shopId: 4,
    name: '招牌卤肉饭套餐',
    price: 2800,
    originalPrice: 3500,
    description: '秘制卤肉+时蔬+卤蛋+饮料',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    stock: 200,
    sold: 845,
    skus: [
      { id: 40101, name: '单份', price: 2800, stock: 150 },
      { id: 40102, name: '双份装', price: 4800, stock: 50 }
    ]
  },
  {
    id: 402,
    shopId: 4,
    name: '香辣鸡排堡套餐',
    price: 3200,
    originalPrice: 4000,
    description: '超大鸡排堡+薯条+可乐',
    imageUrl: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    stock: 180,
    sold: 723,
    skus: [
      { id: 40201, name: '微辣', price: 3200, stock: 120 },
      { id: 40202, name: '中辣', price: 3200, stock: 60 }
    ]
  },
  {
    id: 403,
    shopId: 4,
    name: '工作日特惠便当',
    price: 2200,
    originalPrice: 2800,
    description: '两荤一素+米饭（仅限周一至周五10:00-14:00）',
    imageUrl: 'https://images.pexels.com/photos/851184/pexels-photo-851184.jpeg',
    stock: 150,
    sold: 632,
    skus: [
      { id: 40301, name: 'A套餐', price: 2200, stock: 100 },
      { id: 40302, name: 'B套餐', price: 2200, stock: 50 }
    ]
  },
  {
    id: 404,
    shopId: 4,
    name: '深夜烧烤套餐',
    price: 5800,
    originalPrice: 7800,
    description: '10串混合烧烤+啤酒（20:00-02:00专送）',
    imageUrl: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    stock: 80,
    sold: 328,
    skus: [
      { id: 40401, name: '微辣', price: 5800, stock: 60 },
      { id: 40402, name: '重辣', price: 5800, stock: 20 }
    ]
  },
  {
    id: 405,
    shopId: 4,
    name: '健康轻食沙拉',
    price: 3800,
    originalPrice: 4800,
    description: '鸡胸肉+藜麦+8种时蔬',
    imageUrl: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg',
    stock: 120,
    sold: 215,
    skus: [
      { id: 40501, name: '凯撒酱', price: 3800, stock: 80 },
      { id: 40502, name: '油醋汁', price: 3800, stock: 40 }
    ]
  },
  {
    id: 406,
    shopId: 4,
    name: '家庭分享装',
    price: 8800,
    originalPrice: 11800,
    description: '3荤2素+汤+4人份米饭',
    imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
    stock: 60,
    sold: 98,
    skus: [
      { id: 40601, name: '中式套餐', price: 8800, stock: 40 },
      { id: 40602, name: '混搭套餐', price: 9800, stock: 20 }
    ]
  },
  {
    id: 407,
    shopId: 4,
    name: '早餐元气组合',
    price: 1800,
    originalPrice: 2500,
    description: '三明治+豆浆+鸡蛋（07:00-10:00专送）',
    imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
    stock: 100,
    sold: 432,
    skus: [
      { id: 40701, name: '西式', price: 1800, stock: 70 },
      { id: 40702, name: '中式', price: 1800, stock: 30 }
    ]
  },
  {
    id: 408,
    shopId: 4,
    name: '下午茶甜点组',
    price: 3200,
    originalPrice: 4500,
    description: '4寸蛋糕+2杯奶茶（14:00-17:00）',
    imageUrl: 'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg',
    stock: 50,
    sold: 87,
    skus: [
      { id: 40801, name: '水果蛋糕', price: 3200, stock: 35 },
      { id: 40802, name: '巧克力蛋糕', price: 3500, stock: 15 }
    ]
  },

  {
    id: 1101,
    shopId: 11,
    name: '新鲜水果套餐',
    price: 3800,
    originalPrice: 4800,
    description: '当季水果混合装（约3kg）',
    imageUrl: 'https://images.pexels.com/photos/2274787/pexels-photo-2274787.jpeg',
    stock: 120,
    sold: 356,
    skus: [
      { id: 110101, name: '普通装', price: 3800, stock: 90 },
      { id: 110102, name: '精品装', price: 4800, stock: 30 }
    ]
  },
  {
    id: 1102,
    shopId: 11,
    name: '净菜半成品套餐',
    price: 2800,
    originalPrice: 3500,
    description: '切配好的3菜1汤食材包',
    imageUrl: 'https://images.pexels.com/photos/4553111/pexels-photo-4553111.jpeg',
    stock: 150,
    sold: 278,
    skus: [
      { id: 110201, name: '家常款', price: 2800, stock: 100 },
      { id: 110202, name: '川湘款', price: 3200, stock: 50 }
    ]
  },
  {
    id: 1103,
    shopId: 11,
    name: '海鲜水产组合',
    price: 5800,
    originalPrice: 7800,
    description: '活鱼+虾+贝类（全程冷链）',
    imageUrl: 'https://images.pexels.com/photos/725990/pexels-photo-725990.jpeg',
    stock: 60,
    sold: 132,
    skus: [
      { id: 110301, name: '2人份', price: 5800, stock: 40 },
      { id: 110302, name: '4人份', price: 9800, stock: 20 }
    ]
  },
  {
    id: 1104,
    shopId: 11,
    name: '早餐鲜食包',
    price: 1980,
    originalPrice: 2580,
    description: '鲜奶+面包+鸡蛋（当日生产）',
    imageUrl: 'https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg',
    stock: 200,
    sold: 421,
    skus: [
      { id: 110401, name: '基础款', price: 1980, stock: 150 },
      { id: 110402, name: '豪华款', price: 2580, stock: 50 }
    ]
  },
  {
    id: 1105,
    shopId: 11,
    name: '健身蛋白餐',
    price: 4200,
    originalPrice: 5200,
    description: '鸡胸肉+西兰花+糙米饭',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    stock: 80,
    sold: 156,
    skus: [
      { id: 110501, name: '原味', price: 4200, stock: 60 },
      { id: 110502, name: '黑椒味', price: 4200, stock: 20 }
    ]
  },
  {
    id: 1106,
    shopId: 11,
    name: '火锅食材全家福',
    price: 8800,
    originalPrice: 11800,
    description: '15种涮菜+底料+蘸料',
    imageUrl: 'https://images.pexels.com/photos/6210956/pexels-photo-6210956.jpeg',
    stock: 45,
    sold: 78,
    skus: [
      { id: 110601, name: '清汤款', price: 8800, stock: 30 },
      { id: 110602, name: '麻辣款', price: 9800, stock: 15 }
    ]
  },
  {
    id: 1107,
    shopId: 11,
    name: '办公室零食箱',
    price: 6800,
    originalPrice: 8800,
    description: '20款进口零食组合',
    imageUrl: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg',
    stock: 60,
    sold: 92,
    skus: [
      { id: 110701, name: '亚洲风味', price: 6800, stock: 40 },
      { id: 110702, name: '欧美风味', price: 7200, stock: 20 }
    ]
  },
  {
    id: 1108,
    shopId: 11,
    name: '应急药品速递',
    price: 2500,
    originalPrice: 3500,
    description: '常备药组合（退烧/肠胃/创可贴）',
    imageUrl: 'https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg',
    stock: 30,
    sold: 45,
    skus: [
      { id: 110801, name: '基础款', price: 2500, stock: 25 },
      { id: 110802, name: '家庭款', price: 4500, stock: 5 }
    ]
  },

  {
    id: 1201,
    shopId: 12,
    name: '妈妈红烧肉套餐',
    price: 3800,
    originalPrice: 4800,
    description: '家常做法+鹌鹑蛋+米饭',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    stock: 150,
    sold: 432,
    skus: [
      { id: 120101, name: '标准份', price: 3800, stock: 100 },
      { id: 120102, name: '加量版', price: 4800, stock: 50 }
    ]
  },
  {
    id: 1202,
    shopId: 12,
    name: '老鸭煲套餐',
    price: 5800,
    originalPrice: 6800,
    description: '3小时慢炖+时蔬+米饭',
    imageUrl: 'https://images.pexels.com/photos/6210956/pexels-photo-6210956.jpeg',
    stock: 80,
    sold: 156,
    skus: [
      { id: 120201, name: '半只鸭', price: 5800, stock: 60 },
      { id: 120202, name: '整只鸭', price: 8800, stock: 20 }
    ]
  },
  {
    id: 1203,
    shopId: 12,
    name: '下饭菜组合',
    price: 2800,
    originalPrice: 3500,
    description: '3种招牌小炒+米饭',
    imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
    stock: 200,
    sold: 521,
    skus: [
      { id: 120301, name: '微辣', price: 2800, stock: 150 },
      { id: 120302, name: '中辣', price: 2800, stock: 50 }
    ]
  },
  {
    id: 1204,
    shopId: 12,
    name: '儿童营养餐',
    price: 2500,
    originalPrice: 3200,
    description: '卡通造型+少油少盐',
    imageUrl: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg',
    stock: 120,
    sold: 287,
    skus: [
      { id: 120401, name: 'A套餐', price: 2500, stock: 80 },
      { id: 120402, name: 'B套餐', price: 2500, stock: 40 }
    ]
  },
  {
    id: 1205,
    shopId: 12,
    name: '老人养生套餐',
    price: 3200,
    originalPrice: 4000,
    description: '低糖低脂+软烂易消化',
    imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg',
    stock: 90,
    sold: 132,
    skus: [
      { id: 120501, name: '清淡款', price: 3200, stock: 60 },
      { id: 120502, name: '滋补款', price: 3800, stock: 30 }
    ]
  },
  {
    id: 1206,
    shopId: 12,
    name: '应急速食包',
    price: 1800,
    originalPrice: 2500,
    description: '5分钟即食料理（微波加热）',
    imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
    stock: 180,
    sold: 356,
    skus: [
      { id: 120601, name: '炒饭', price: 1800, stock: 120 },
      { id: 120602, name: '意面', price: 2000, stock: 60 }
    ]
  },
  {
    id: 1207,
    shopId: 12,
    name: '家乡味腌制品',
    price: 3500,
    originalPrice: 4500,
    description: '农家自制腊肠/酱菜',
    imageUrl: 'https://images.pexels.com/photos/5409010/pexels-photo-5409010.jpeg',
    stock: 60,
    sold: 98,
    skus: [
      { id: 120701, name: '200g装', price: 3500, stock: 50 },
      { id: 120702, name: '500g装', price: 6800, stock: 10 }
    ]
  },
  {
    id: 1208,
    shopId: 12,
    name: '手工面点组合',
    price: 2800,
    originalPrice: 3800,
    description: '包子/馒头/花卷（10个装）',
    imageUrl: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    stock: 100,
    sold: 187,
    skus: [
      { id: 120801, name: '混搭装', price: 2800, stock: 80 },
      { id: 120802, name: '单一口味', price: 2500, stock: 20 }
    ]
  },

  {
    id: 1301,
    shopId: 13,
    name: '经典画舫游船票',
    price: 8000, // 单位：分（80元）
    originalPrice: 10000,
    description: '50分钟环湖游览，含景点讲解',
    imageUrl: 'https://images.pexels.com/photos/6276788/pexels-photo-6276788.jpeg',
    stock: 500,
    sold: 2350,
    skus: [
      { id: 130101, name: '成人票', price: 8000, stock: 350 },
      { id: 130102, name: '儿童票', price: 5000, stock: 100 },
      { id: 130103, name: 'VIP包厢', price: 15000, stock: 50 }
    ]
  },
  {
    id: 1302,
    shopId: 13,
    name: '夜游西湖灯光秀',
    price: 12000,
    originalPrice: 15000,
    description: '18:30-20:00夜间特别航次，欣赏灯光喷泉',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
    stock: 200,
    sold: 680,
    skus: [
      { id: 130201, name: '普通座', price: 12000, stock: 150 },
      { id: 130202, name: '露台座', price: 18000, stock: 50 }
    ]
  },
  {
    id: 1303,
    shopId: 13,
    name: '西湖深度游套票',
    price: 18000,
    originalPrice: 22000,
    description: '含游船+雷峰塔登顶+三潭印月岛门票',
    imageUrl: 'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg',
    stock: 300,
    sold: 890,
    skus: [
      { id: 130301, name: '单人套票', price: 18000, stock: 200 },
      { id: 130302, name: '家庭套票', price: 40000, stock: 100 }
    ]
  },
  {
    id: 1401,
    shopId: 14,
    name: '灵隐寺门票',
    price: 4500, // 单位：分（45元）
    originalPrice: 5000,
    description: '含飞来峰景区+灵隐寺香火券',
    imageUrl: 'https://images.unsplash.com/photo-1609142621730-db3293839541',
    stock: 1000,
    sold: 5230,
    skus: [
      { id: 140101, name: '成人票', price: 4500, stock: 700 },
      { id: 140102, name: '优惠票', price: 2500, stock: 200 },
      { id: 140103, name: '香客年卡', price: 20000, stock: 100 }
    ]
  },
  {
    id: 1402,
    shopId: 14,
    name: '禅修体验课',
    price: 8800,
    originalPrice: 10800,
    description: '2小时寺庙禅修+素斋体验',
    imageUrl: 'https://images.pexels.com/photos/685232/pexels-photo-685232.jpeg',
    stock: 50,
    sold: 132,
    skus: [
      { id: 140201, name: '上午场', price: 8800, stock: 30 },
      { id: 140202, name: '下午场', price: 8800, stock: 20 }
    ]
  },
  {
    id: 1403,
    shopId: 14,
    name: '文化讲解套餐',
    price: 6800,
    originalPrice: 8800,
    description: '专业讲解员带队+重点文物讲解',
    imageUrl: 'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg',
    stock: 80,
    sold: 215,
    skus: [
      { id: 140301, name: '中文讲解', price: 6800, stock: 60 },
      { id: 140302, name: '英文讲解', price: 9800, stock: 20 }
    ]
  },

  {
    id: 1501,
    shopId: 15,
    name: '首席设计师剪发',
    price: 19800,
    originalPrice: 25800,
    description: '总监级设计师服务+头皮检测+造型建议',
    imageUrl: 'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg',
    stock: 30,  // 可预约数
    sold: 256,
    skus: [
      { id: 150101, name: '男士剪发', price: 15800, stock: 15 },
      { id: 150102, name: '女士剪发', price: 19800, stock: 15 }
    ]
  },
  {
    id: 1502,
    shopId: 15,
    name: '日系空气烫染套餐',
    price: 58800,
    originalPrice: 78800,
    description: '资生堂药水+日本技师操作+护理礼包',
    imageUrl: 'https://images.pexels.com/photos/3363720/pexels-photo-3363720.jpeg',
    stock: 15,
    sold: 89,
    skus: [
      { id: 150201, name: '短发', price: 58800, stock: 8 },
      { id: 150202, name: '中长发', price: 68800, stock: 7 }
    ]
  },
  {
    id: 1503,
    shopId: 15,
    name: '头发护理三部曲',
    price: 32800,
    originalPrice: 42800,
    description: '深层清洁+纳米护理+光泽锁色',
    imageUrl: 'https://images.pexels.com/photos/3997374/pexels-photo-3997374.jpeg',
    stock: 20,
    sold: 132,
    skus: [
      { id: 150301, name: '单次体验', price: 32800, stock: 15 },
      { id: 150302, name: '3次卡', price: 88800, stock: 5 }
    ]
  },
  {
    id: 1504,
    shopId: 15,
    name: '新娘造型全案',
    price: 128800,
    originalPrice: 158800,
    description: '试妆+婚礼日跟妆+3组发型设计',
    imageUrl: 'https://images.pexels.com/photos/3671083/pexels-photo-3671083.jpeg',
    stock: 5,
    sold: 12,
    skus: [
      { id: 150401, name: '简约款', price: 128800, stock: 3 },
      { id: 150402, name: '豪华款', price: 158800, stock: 2 }
    ]
  },
  {
    id: 1505,
    shopId: 15,
    name: '男士精修理发',
    price: 12800,
    originalPrice: 16800,
    description: '渐变修剪+胡须造型+颈部热敷',
    imageUrl: 'https://images.pexels.com/photos/3058850/pexels-photo-3058850.jpeg',
    stock: 40,
    sold: 187,
    skus: [
      { id: 150501, name: '基础修剪', price: 12800, stock: 30 },
      { id: 150502, name: '全套服务', price: 18800, stock: 10 }
    ]
  },

  // 东方SPA会所（ID:16）
  {
    id: 1601,
    shopId: 16,
    name: '古法泰式SPA',
    price: 32800,
    originalPrice: 42800,
    description: '90分钟全身拉伸+草药包热敷',
    imageUrl: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
    stock: 12,
    sold: 45,
    skus: [
      { id: 160101, name: '经典泰式', price: 32800, stock: 8 },
      { id: 160102, name: '皇家泰式', price: 42800, stock: 4 }
    ]
  },
  {
    id: 1602,
    shopId: 16,
    name: '玉石热石精油SPA',
    price: 48800,
    originalPrice: 58800,
    description: '和田玉按摩+植物精油+热石理疗',
    imageUrl: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg',
    stock: 8,
    sold: 23,
    skus: [
      { id: 160201, name: '60分钟', price: 38800, stock: 6 },
      { id: 160202, name: '90分钟', price: 48800, stock: 2 }
    ]
  },
  {
    id: 1603,
    shopId: 16,
    name: '中式经络调理',
    price: 28800,
    originalPrice: 38800,
    description: '推拿拔罐+艾灸+穴位疏通',
    imageUrl: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg',
    stock: 15,
    sold: 38,
    skus: [
      { id: 160301, name: '局部调理', price: 28800, stock: 12 },
      { id: 160302, name: '全身调理', price: 38800, stock: 3 }
    ]
  },
  {
    id: 1604,
    shopId: 16,
    name: '双人浪漫SPA套餐',
    price: 98800,
    originalPrice: 128800,
    description: '私密包厢+香薰按摩+花瓣浴',
    imageUrl: 'https://images.pexels.com/photos/6621337/pexels-photo-6621337.jpeg',
    stock: 5,
    sold: 9,
    skus: [
      { id: 160401, name: '月光套餐', price: 98800, stock: 3 },
      { id: 160402, name: '星空套餐', price: 118800, stock: 2 }
    ]
  },
  {
    id: 1605,
    shopId: 16,
    name: '孕期舒缓护理',
    price: 35800,
    originalPrice: 45800,
    description: '孕妇专用精油+侧卧按摩技法',
    imageUrl: 'https://images.pexels.com/photos/4473327/pexels-photo-4473327.jpeg',
    stock: 6,
    sold: 7,
    skus: [
      { id: 160501, name: '孕中期', price: 35800, stock: 4 },
      { id: 160502, name: '孕晚期', price: 38800, stock: 2 }
    ]
  },

  {
    id: 1701,
    shopId: 17,
    name: '美妆惊喜礼盒',
    price: 58800,
    originalPrice: 78800,
    description: '包含5款热门大牌中小样+正装口红',
    imageUrl: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg',
    stock: 120,
    sold: 356,
    skus: [
      { id: 170101, name: '护肤套装', price: 58800, stock: 80 },
      { id: 170102, name: '彩妆套装', price: 65800, stock: 40 }
    ]
  },
  {
    id: 1702,
    shopId: 17,
    name: '轻奢下午茶套餐',
    price: 19800,
    originalPrice: 25800,
    description: '指定餐厅双人套餐+观景座位',
    imageUrl: 'https://images.pexels.com/photos/405238/pexels-photo-405238.jpeg',
    stock: 60,
    sold: 142,
    skus: [
      { id: 170201, name: '平日券', price: 19800, stock: 40 },
      { id: 170202, name: '周末券', price: 22800, stock: 20 }
    ]
  },
  {
    id: 1703,
    shopId: 17,
    name: '黄金饰品工费券',
    price: 8800,
    originalPrice: 12800,
    description: '周大福/老凤祥等品牌工费5折优惠',
    imageUrl: 'https://images.pexels.com/photos/965981/pexels-photo-965981.jpeg',
    stock: 80,
    sold: 215,
    skus: [
      { id: 170301, name: '项链类', price: 8800, stock: 50 },
      { id: 170302, name: '戒指类', price: 6800, stock: 30 }
    ]
  },
  {
    id: 1704,
    shopId: 17,
    name: '亲子游乐套票',
    price: 28800,
    originalPrice: 38800,
    description: '儿童乐园+VR体验馆+亲子餐厅代金券',
    imageUrl: 'https://images.pexels.com/photos/6474584/pexels-photo-6474584.jpeg',
    stock: 45,
    sold: 98,
    skus: [
      { id: 170401, name: '1大1小', price: 28800, stock: 30 },
      { id: 170402, name: '2大1小', price: 38800, stock: 15 }
    ]
  },
  {
    id: 1705,
    shopId: 17,
    name: '数码产品以旧换新券',
    price: 10000,
    originalPrice: 15000,
    description: '苹果/华为等品牌额外折价10%',
    imageUrl: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg',
    stock: 200,
    sold: 156,
    skus: [
      { id: 170501, name: '手机类', price: 10000, stock: 150 },
      { id: 170502, name: '电脑类', price: 15000, stock: 50 }
    ]
  },
  {
    id: 1706,
    shopId: 17,
    name: '国际运动品牌折扣包',
    price: 38800,
    originalPrice: 58800,
    description: '耐克/阿迪达斯等品牌满1000减200',
    imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    stock: 150,
    sold: 287,
    skus: [
      { id: 170601, name: '鞋类专用', price: 38800, stock: 100 },
      { id: 170602, name: '服装专用', price: 28800, stock: 50 }
    ]
  },
  {
    id: 1707,
    shopId: 17,
    name: '超市购物卡',
    price: 50000,
    originalPrice: 50000,
    description: '银泰超市500元电子购物卡',
    imageUrl: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg',
    stock: 300,
    sold: 542,
    skus: [
      { id: 170701, name: '电子卡', price: 50000, stock: 200 },
      { id: 170702, name: '实体卡', price: 50000, stock: 100 }
    ]
  },
  {
    id: 1708,
    shopId: 17,
    name: 'VIP停车特权包',
    price: 8800,
    originalPrice: 12800,
    description: '3小时免费停车+洗车服务',
    imageUrl: 'https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg',
    stock: 100,
    sold: 87,
    skus: [
      { id: 170801, name: '平日券', price: 8800, stock: 70 },
      { id: 170802, name: '周末券', price: 10800, stock: 30 }
    ]
  },

  // 杭州万象城（ID:18）
  {
    id: 1801,
    shopId: 18,
    name: '奢侈品护理套餐',
    price: 128800,
    originalPrice: 158800,
    description: '爱马仕/LV等品牌皮具清洁保养',
    imageUrl: 'https://images.pexels.com/photos/3732891/pexels-photo-3732891.jpeg',
    stock: 30,
    sold: 45,
    skus: [
      { id: 180101, name: '小件护理', price: 128800, stock: 20 },
      { id: 180102, name: '大件护理', price: 158800, stock: 10 }
    ]
  },
  {
    id: 1802,
    shopId: 18,
    name: '米其林餐厅代金券',
    price: 38800,
    originalPrice: 48800,
    description: '指定米其林餐厅满500减100',
    imageUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    stock: 80,
    sold: 132,
    skus: [
      { id: 180201, name: '午餐券', price: 38800, stock: 50 },
      { id: 180202, name: '晚餐券', price: 48800, stock: 30 }
    ]
  },
  {
    id: 1803,
    shopId: 18,
    name: '高端影院套票',
    price: 28800,
    originalPrice: 38800,
    description: 'VIP厅观影+小吃套餐',
    imageUrl: 'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg',
    stock: 60,
    sold: 98,
    skus: [
      { id: 180301, name: '单人票', price: 28800, stock: 40 },
      { id: 180302, name: '情侣票', price: 48800, stock: 20 }
    ]
  },
  {
    id: 1804,
    shopId: 18,
    name: '国际美妆体验装',
    price: 18800,
    originalPrice: 28800,
    description: 'La Mer/SK-II等品牌新品试用套装',
    imageUrl: 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg',
    stock: 150,
    sold: 215,
    skus: [
      { id: 180401, name: '护肤套装', price: 18800, stock: 100 },
      { id: 180402, name: '彩妆套装', price: 15800, stock: 50 }
    ]
  },
  {
    id: 1805,
    shopId: 18,
    name: '设计师品牌折扣券',
    price: 10000,
    originalPrice: 20000,
    description: '指定设计师品牌季末5折特权',
    imageUrl: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
    stock: 200,
    sold: 156,
    skus: [
      { id: 180501, name: '女装专用', price: 10000, stock: 150 },
      { id: 180502, name: '男装专用', price: 10000, stock: 50 }
    ]
  },
  {
    id: 1806,
    shopId: 18,
    name: '进口超市尝鲜包',
    price: 28800,
    originalPrice: 38800,
    description: '10款网红进口零食组合',
    imageUrl: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg',
    stock: 120,
    sold: 87,
    skus: [
      { id: 180601, name: '亚洲风味', price: 28800, stock: 80 },
      { id: 180602, name: '欧美风味', price: 32800, stock: 40 }
    ]
  },
  {
    id: 1807,
    shopId: 18,
    name: '会员专属停车卡',
    price: 18800,
    originalPrice: 28800,
    description: '当日不限时停车+代客泊车',
    imageUrl: 'https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg',
    stock: 80,
    sold: 65,
    skus: [
      { id: 180701, name: '普通会员', price: 18800, stock: 60 },
      { id: 180702, name: '金卡会员', price: 0, stock: 20 }
    ]
  },
  {
    id: 1808,
    shopId: 18,
    name: '儿童乐园畅玩卡',
    price: 38800,
    originalPrice: 58800,
    description: '全馆儿童设施不限次体验',
    imageUrl: 'https://images.pexels.com/photos/6474584/pexels-photo-6474584.jpeg',
    stock: 50,
    sold: 32,
    skus: [
      { id: 180801, name: '单日卡', price: 38800, stock: 40 },
      { id: 180802, name: '月卡', price: 88800, stock: 10 }
    ]
  },

  // 超级健身房（ID:19）
  {
    id: 1901,
    shopId: 19,
    name: '全能健身月卡',
    price: 12800,
    originalPrice: 15800,
    description: '器械区+团课无限次使用+体测1次',
    imageUrl: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
    stock: 100, // 可售数量
    sold: 286,
    skus: [
      { id: 190101, name: '普通时段', price: 12800, stock: 70 },
      { id: 190102, name: '全时段', price: 15800, stock: 30 }
    ]
  },
  {
    id: 1902,
    shopId: 19,
    name: '私教体验套餐',
    price: 9800,
    originalPrice: 12800,
    description: '3节私教课+饮食计划制定',
    imageUrl: 'https://images.pexels.com/photos/6550826/pexels-photo-6550826.jpeg',
    stock: 50,
    sold: 132,
    skus: [
      { id: 190201, name: '基础课', price: 9800, stock: 40 },
      { id: 190202, name: '专项课', price: 11800, stock: 10 }
    ]
  },
  {
    id: 1903,
    shopId: 19,
    name: '企业团体卡',
    price: 88800,
    originalPrice: 108800,
    description: '10人团体3个月健身权限',
    imageUrl: 'https://images.pexels.com/photos/4662348/pexels-photo-4662348.jpeg',
    stock: 20,
    sold: 15,
    skus: [
      { id: 190301, name: '基础版', price: 88800, stock: 15 },
      { id: 190302, name: 'VIP版', price: 108800, stock: 5 }
    ]
  },
  {
    id: 1904,
    shopId: 19,
    name: '青少年体适能课',
    price: 6800,
    originalPrice: 8800,
    description: '8-16岁专项训练（每周2次）',
    imageUrl: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
    stock: 40,
    sold: 28,
    skus: [
      { id: 190401, name: '基础班', price: 6800, stock: 30 },
      { id: 190402, name: '进阶班', price: 8800, stock: 10 }
    ]
  },

  // 游泳健身中心（ID:20）
  {
    id: 2001,
    shopId: 20,
    name: '游泳季卡',
    price: 15800,
    originalPrice: 18800,
    description: '90天无限次游泳+桑拿使用',
    imageUrl: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0',
    stock: 80,
    sold: 195,
    skus: [
      { id: 200101, name: '单泳池', price: 15800, stock: 60 },
      { id: 200102, name: '全设施', price: 18800, stock: 20 }
    ]
  },
  {
    id: 2002,
    shopId: 20,
    name: '亲子游泳课',
    price: 12800,
    originalPrice: 15800,
    description: '1大1小十次课程包（含教练）',
    imageUrl: 'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg',
    stock: 30,
    sold: 42,
    skus: [
      { id: 200201, name: '周末班', price: 12800, stock: 20 },
      { id: 200202, name: '平日班', price: 10800, stock: 10 }
    ]
  },
  {
    id: 2003,
    shopId: 20,
    name: '水中康复课程',
    price: 19800,
    originalPrice: 22800,
    description: '针对运动损伤的水疗康复方案',
    imageUrl: 'https://images.pexels.com/photos/5069203/pexels-photo-5069203.jpeg',
    stock: 15,
    sold: 8,
    skus: [
      { id: 200301, name: '5次卡', price: 19800, stock: 12 },
      { id: 200302, name: '10次卡', price: 35800, stock: 3 }
    ]
  },
  {
    id: 2004,
    shopId: 20,
    name: '暑期游泳培训班',
    price: 28800,
    originalPrice: 38800,
    description: '儿童游泳速成班（连续15天）',
    imageUrl: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg',
    stock: 25,
    sold: 18,
    skus: [
      { id: 200401, name: '基础班', price: 28800, stock: 20 },
      { id: 200402, name: '提高班', price: 38800, stock: 5 }
    ]
  },

  // 便民洗衣店（ID:21）
  {
    id: 2101,
    shopId: 21,
    name: '标准干洗套餐',
    price: 5800,
    originalPrice: 6800,
    description: '西装/大衣专业干洗（3件起洗）',
    imageUrl: 'https://images.pexels.com/photos/4488643/pexels-photo-4488643.jpeg',
    stock: 100,
    sold: 542,
    skus: [
      { id: 210101, name: '普通衣物', price: 5800, stock: 80 },
      { id: 210102, name: '奢侈品牌', price: 8800, stock: 20 }
    ]
  },
  {
    id: 2102,
    shopId: 21,
    name: '家庭洗涤月卡',
    price: 18800,
    originalPrice: 22800,
    description: '每月20kg衣物洗护（不限次数）',
    imageUrl: 'https://images.pexels.com/photos/5709026/pexels-photo-5709026.jpeg',
    stock: 50,
    sold: 132,
    skus: [
      { id: 210201, name: '普通衣物', price: 18800, stock: 40 },
      { id: 210202, name: '含奢侈品', price: 25800, stock: 10 }
    ]
  },
  {
    id: 2103,
    shopId: 21,
    name: '鞋类深度清洁',
    price: 3800,
    originalPrice: 4800,
    description: '真皮/运动鞋专业清洁保养',
    imageUrl: 'https://images.pexels.com/photos/6069557/pexels-photo-6069557.jpeg',
    stock: 80,
    sold: 215,
    skus: [
      { id: 210301, name: '普通鞋', price: 3800, stock: 60 },
      { id: 210302, name: '奢侈品牌', price: 6800, stock: 20 }
    ]
  },
  {
    id: 2104,
    shopId: 21,
    name: '紧急3小时快洗',
    price: 9800,
    originalPrice: 12800,
    description: '加急服务（需提前预约）',
    imageUrl: 'https://images.pexels.com/photos/5709030/pexels-photo-5709030.jpeg',
    stock: 20,
    sold: 45,
    skus: [
      { id: 210401, name: '单件', price: 9800, stock: 15 },
      { id: 210402, name: '3件套', price: 22800, stock: 5 }
    ]
  },
  {
    id: 2105,
    shopId: 21,
    name: '窗帘地毯专洗',
    price: 15800,
    originalPrice: 19800,
    description: '大件物品上门取送服务',
    imageUrl: 'https://images.pexels.com/photos/6001379/pexels-photo-6001379.jpeg',
    stock: 30,
    sold: 28,
    skus: [
      { id: 210501, name: '窗帘', price: 15800, stock: 20 },
      { id: 210502, name: '地毯', price: 19800, stock: 10 }
    ]
  },

  // 家政服务中心（ID:22）
  {
    id: 2201,
    shopId: 22,
    name: '深度保洁套餐',
    price: 16800,
    originalPrice: 19800,
    description: '4小时专业深度清洁（含厨房卫生间）',
    imageUrl: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957',
    stock: 60,
    sold: 156,
    skus: [
      { id: 220101, name: '80㎡以下', price: 16800, stock: 40 },
      { id: 220102, name: '80-120㎡', price: 21800, stock: 20 }
    ]
  },
  {
    id: 2202,
    shopId: 22,
    name: '长期保洁月卡',
    price: 58800,
    originalPrice: 68800,
    description: '每周2次常规保洁（每次3小时）',
    imageUrl: 'https://images.pexels.com/photos/4107253/pexels-photo-4107253.jpeg',
    stock: 30,
    sold: 42,
    skus: [
      { id: 220201, name: '基础清洁', price: 58800, stock: 25 },
      { id: 220202, name: '含擦窗', price: 68800, stock: 5 }
    ]
  },
  {
    id: 2203,
    shopId: 22,
    name: '家电清洗套餐',
    price: 12800,
    originalPrice: 15800,
    description: '空调/油烟机/洗衣机深度清洗',
    imageUrl: 'https://images.pexels.com/photos/4488643/pexels-photo-4488643.jpeg',
    stock: 45,
    sold: 38,
    skus: [
      { id: 220301, name: '单台', price: 12800, stock: 35 },
      { id: 220302, name: '3台组合', price: 32800, stock: 10 }
    ]
  },
  {
    id: 2204,
    shopId: 22,
    name: '育儿嫂服务',
    price: 380000,
    originalPrice: 450000,
    description: '专业育儿嫂（26天/月）',
    imageUrl: 'https://images.pexels.com/photos/4473327/pexels-photo-4473327.jpeg',
    stock: 10,
    sold: 8,
    skus: [
      { id: 220401, name: '白班', price: 380000, stock: 8 },
      { id: 220402, name: '住家', price: 480000, stock: 2 }
    ]
  },
  {
    id: 2205,
    shopId: 22,
    name: '春节大扫除',
    price: 28800,
    originalPrice: 38800,
    description: '全屋6小时彻底清洁（含玻璃）',
    imageUrl: 'https://images.pexels.com/photos/4107275/pexels-photo-4107275.jpeg',
    stock: 50,
    sold: 32,
    skus: [
      { id: 220501, name: '小户型', price: 28800, stock: 40 },
      { id: 220502, name: '大户型', price: 38800, stock: 10 }
    ]
  },

  // 康复理疗中心（ID:23）
  {
    id: 2301,
    shopId: 23,
    name: '脊柱调理套餐',
    price: 29800,
    originalPrice: 39800,
    description: '专业整脊+物理治疗（3次疗程）',
    imageUrl: 'https://images.pexels.com/photos/7088521/pexels-photo-7088521.jpeg',
    stock: 30,
    sold: 45,
    skus: [
      { id: 230101, name: '基础调理', price: 29800, stock: 25 },
      { id: 230102, name: '深度矫正', price: 39800, stock: 5 }
    ]
  },
  {
    id: 2302,
    shopId: 23,
    name: '运动损伤康复',
    price: 35800,
    originalPrice: 45800,
    description: '针对健身损伤的专业恢复方案',
    imageUrl: 'https://images.pexels.com/photos/5069203/pexels-photo-5069203.jpeg',
    stock: 25,
    sold: 18,
    skus: [
      { id: 230201, name: '单次', price: 35800, stock: 20 },
      { id: 230202, name: '5次卡', price: 158000, stock: 5 }
    ]
  },
  {
    id: 2303,
    shopId: 23,
    name: '中医推拿套餐',
    price: 19800,
    originalPrice: 25800,
    description: '60分钟经络疏通+拔罐',
    imageUrl: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg',
    stock: 40,
    sold: 32,
    skus: [
      { id: 230301, name: '局部', price: 19800, stock: 30 },
      { id: 230302, name: '全身', price: 25800, stock: 10 }
    ]
  },
  {
    id: 2304,
    shopId: 23,
    name: '产后康复计划',
    price: 68800,
    originalPrice: 88800,
    description: '盆底肌修复+腹直肌调理（10次）',
    imageUrl: 'https://images.pexels.com/photos/4473327/pexels-photo-4473327.jpeg',
    stock: 15,
    sold: 9,
    skus: [
      { id: 230401, name: '基础版', price: 68800, stock: 12 },
      { id: 230402, name: '尊享版', price: 98800, stock: 3 }
    ]
  },
  {
    id: 2305,
    shopId: 23,
    name: '老年理疗月卡',
    price: 48800,
    originalPrice: 58800,
    description: '每周3次理疗（含艾灸）',
    imageUrl: 'https://images.pexels.com/photos/7088523/pexels-photo-7088523.jpeg',
    stock: 20,
    sold: 12,
    skus: [
      { id: 230501, name: '基础理疗', price: 48800, stock: 15 },
      { id: 230502, name: '定制方案', price: 68800, stock: 5 }
    ]
  },

  // 口腔诊所（ID:24）
  {
    id: 2401,
    shopId: 24,
    name: '超声波洁牙套餐',
    price: 38800,
    originalPrice: 48800,
    description: '全口洁治+抛光+口腔检查',
    imageUrl: 'https://images.pexels.com/photos/6621334/pexels-photo-6621334.jpeg',
    stock: 60,
    sold: 45,
    skus: [
      { id: 240101, name: '基础洁牙', price: 38800, stock: 50 },
      { id: 240102, name: '舒适洁牙', price: 58800, stock: 10 }
    ]
  },
  {
    id: 2402,
    shopId: 24,
    name: '儿童窝沟封闭',
    price: 28800,
    originalPrice: 38800,
    description: '3颗大牙防护（含检查）',
    imageUrl: 'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg',
    stock: 40,
    sold: 28,
    skus: [
      { id: 240201, name: '单颗', price: 12800, stock: 30 },
      { id: 240202, name: '3颗套餐', price: 28800, stock: 10 }
    ]
  },
  {
    id: 2403,
    shopId: 24,
    name: '隐形矫正咨询',
    price: 9800,
    originalPrice: 12800,
    description: '数字化方案设计+3D模拟',
    imageUrl: 'https://images.pexels.com/photos/4269693/pexels-photo-4269693.jpeg',
    stock: 30,
    sold: 15,
    skus: [
      { id: 240301, name: '初诊', price: 9800, stock: 25 },
      { id: 240302, name: '含X光', price: 15800, stock: 5 }
    ]
  },
  {
    id: 2404,
    shopId: 24,
    name: '全瓷牙修复',
    price: 258800,
    originalPrice: 288800,
    description: '德国材料（含10年质保）',
    imageUrl: 'https://images.pexels.com/photos/4269688/pexels-photo-4269688.jpeg',
    stock: 15,
    sold: 8,
    skus: [
      { id: 240401, name: '单颗', price: 258800, stock: 12 },
      { id: 240402, name: '3颗套装', price: 688800, stock: 3 }
    ]
  },
  {
    id: 2405,
    shopId: 24,
    name: '牙齿美白套餐',
    price: 18800,
    originalPrice: 25800,
    description: '冷光美白（维持2年）',
    imageUrl: 'https://images.pexels.com/photos/4269689/pexels-photo-4269689.jpeg',
    stock: 25,
    sold: 12,
    skus: [
      { id: 240501, name: '基础美白', price: 18800, stock: 20 },
      { id: 240502, name: '尊享美白', price: 28800, stock: 5 }
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
  let results = filteredGoods.map(item => {
    // 从全局shops数组中查找商铺
    const shop = shops.find(shop => shop.id === item.shopId) || {
      name: '未知商铺',
      address: '暂无地址信息',
      score: 0
    }
    
    return {
      ...item,
      shopName: shop.name,
      shopAddress: shop.address,
      shopScore: shop.score
    }
  })
  
  // 排序处理
  if (params.sortBy) {
    const sortField = params.sortBy
    const sortOrder = params.sortOrder || 'desc'
    
    results.sort((a, b) => {
      let result = 0
      
      switch (sortField) {
        case 'price':
          result = sortOrder === 'asc' ? a.price - b.price : b.price - a.price
          break
        case 'sold':
          result = sortOrder === 'asc' ? a.sold - b.sold : b.sold - a.sold
          break
        default:
          result = 0
      }
      
      return result
    })
  }
  
  return {
    success: true,
    data: results,
    total: results.length
  }
})

// 将模块导出以便在index.js中引入
export default {}
