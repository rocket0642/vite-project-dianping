import Mock from 'mockjs'

// 初始订单数据
const defaultOrders = [
  {
    id: 10001,
    userPhone: '13800138000',
    shopId: 1,
    shopName: '店铺1',
    goodsId: 1,
    goodsName: '经典牛肉汉堡',
    count: 2,
    goodsPrice: 2800,
    amount: 5600,
    addressId: 1,
    addressName: '张三',
    addressPhone: '13800138000',
    addressDetail: '北京市海淀区中关村大街1号',
    status: 2, // 已支付
    createTime: '2023-06-15 12:00:00',
    payTime: '2023-06-15 12:05:00',
    payType: 1
  },
  {
    id: 10002,
    userPhone: '13800138001',
    shopId: 2,
    shopName: '舒适酒店',
    goodsId: 5,
    goodsName: '舒适大床房',
    count: 1,
    goodsPrice: 29900,
    amount: 29900,
    addressId: 1,
    addressName: '张三',
    addressPhone: '13800138000',
    addressDetail: '北京市海淀区中关村大街1号',
    status: 3, // 已取消
    createTime: '2023-06-16 14:30:00',
    payTime: null,
    payType: null
  }
];

// 从localStorage获取订单数据
let orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');

// 保存订单数据到localStorage
const saveOrders = () => {
  localStorage.setItem('mock_orders', JSON.stringify(orders));
};

// 从token中统一获取userPhone的辅助函数
function getUserPhoneFromToken() {
  const userStore = JSON.parse(localStorage.getItem('user-store') || '{}')
  console.log(userStore)
  const userPhone = userStore.userPhone
  return userPhone? userPhone : ""
}

// 创建订单接口
Mock.mock('/api/order/create', 'post', (options) => {
  // 从token中获取用户ID，而不是从localStorage
  const userPhone = getUserPhoneFromToken();
  
  const { body } = options;
  const orderData = JSON.parse(body);
  
  // 生成新订单ID
  const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 10001;
  
  // 获取当前时间
  const now = new Date();
  const formattedTime = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
  
  // 创建新订单
  const newOrder = {
    id: newOrderId,
    userPhone: userPhone,
    shopId: orderData.shopId,
    shopName: orderData.shopName || `店铺${orderData.shopId}`,
    goodsId: orderData.items ? orderData.items[0].goodsId : orderData.goodsId,
    goodsName: orderData.items ? orderData.items[0].goodsName : orderData.goodsName,
    count: orderData.items ? orderData.items.reduce((sum, item) => sum + item.count, 0) : orderData.count,
    goodsPrice: orderData.items ? orderData.items[0].price : orderData.price,
    items: orderData.items || [],
    amount: orderData.amount,
    addressId: orderData.addressId,
    addressName: orderData.addressName,
    addressPhone: orderData.addressPhone,
    addressDetail: orderData.addressDetail,
    remark: orderData.remark || '',
    status: 1, // 未支付
    createTime: formattedTime,
    payTime: null,
    payType: null
  };
  
  // 添加到订单列表
  orders.push(newOrder);
  
  // 保存数据
  saveOrders();
  
  return {
    success: true,
    data: newOrderId
  };
});

// 获取订单详情
Mock.mock(/\/api\/order\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/order\/detail\/(\d+)/)[1]);
  // 获取当前登录用户ID
  const userPhone = getUserPhoneFromToken();
  const order = orders.find(o => o.id === id);
  
  if (order) {
    // 验证订单所属用户
    if (order.userPhone !== userPhone) {
      return {
        success: false,
        errorMsg: '无权访问此订单'
      };
    }
    // 查询订单是否已评价
    const commented = comments.some(c => c.orderId === order.id);
    
    return {
      success: true,
      data: {
        ...order,
        commented
      }
    };
  }
  
  return {
    success: false,
    errorMsg: '订单不存在'
  };
});

// 获取订单状态（新增接口，与API接口路径匹配）
Mock.mock(/\/api\/order\/status\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/order\/status\/(\d+)/)[1]);
  // 获取当前登录用户ID
  const userPhone = getUserPhoneFromToken();
  const order = orders.find(o => o.id === id);
  
  if (order) {
    // 验证订单所属用户
    if (order.userPhone !== userPhone) {
      return {
        success: false,
        errorMsg: '无权访问此订单'
      };
    }
    return {
      success: true,
      data: order
    };
  }
  
  return {
    success: false,
    errorMsg: '订单不存在'
  };
});

// 获取用户订单列表
Mock.mock(/\/api\/order\/list(\?.*)?$/, 'get', (options) => {
  // 获取查询参数
  const url = new URL(`http://localhost${options.url}`);
  const status = url.searchParams.get('status');
  const statuses = url.searchParams.get('statuses'); // 多状态参数
  const currentPage = parseInt(url.searchParams.get('current')) || 1;
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
  
  // 从token获取当前登录用户ID
  const userPhone = getUserPhoneFromToken();
  
  // 根据用户ID筛选订单
  let filteredOrders = [...orders].filter(o => o.userPhone === userPhone);
  
  // 多状态筛选
  if (statuses) {
    const statusArray = statuses.split(',').map(s => parseInt(s));
    filteredOrders = filteredOrders.filter(o => statusArray.includes(o.status));
  }
  // 单状态筛选
  else if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === parseInt(status));
  }
  
  // 按创建时间倒序排序 (最新订单在前)
  filteredOrders.sort((a, b) => {
    const timeA = new Date(a.createTime.replace(/-/g, '/')).getTime();
    const timeB = new Date(b.createTime.replace(/-/g, '/')).getTime();
    return timeB - timeA; // 倒序排列
  });
  
  // 总数量
  const total = filteredOrders.length;
  
  // 分页处理
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedOrders = filteredOrders.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: pagedOrders,
    total: total
  };
});

// 支付订单
Mock.mock('/api/order/pay', 'post', (options) => {
  try {
    const { body } = options;
    const data = JSON.parse(body);
    const orderId = parseInt(data.orderId);
    const payType = data.payType || 1;
    
    // 获取当前登录用户ID
    const userPhone = getUserPhoneFromToken();
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return {
        success: false,
        errorMsg: '订单不存在'
      };
    }
    
    // 验证订单所属用户
    if (orders[orderIndex].userPhone !== userPhone) {
      return {
        success: false,
        errorMsg: '无权操作此订单'
      };
    }
    
    // 检查订单状态是否为未支付
    if (orders[orderIndex].status !== 1) {
      return {
        success: false,
        errorMsg: '订单状态错误，不能支付'
      };
    }
    
    // 更新订单状态
    orders[orderIndex].status = 2; // 已支付
    orders[orderIndex].payTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
    orders[orderIndex].payType = payType;
    
    // 保存到localStorage
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    
    // 5秒后自动将订单状态更新为待收货状态
    setTimeout(() => {
      // 再次检查订单是否存在且状态是已支付
      const currentIndex = orders.findIndex(o => o.id === orderId);
      if (currentIndex !== -1 && orders[currentIndex].status === 2) {
        // 更新为待收货状态
        orders[currentIndex].status = 4;
        orders[currentIndex].deliveryTime = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-');
        
        // 保存到localStorage
        localStorage.setItem('mock_orders', JSON.stringify(orders));
      }
    }, 5000);
    
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('支付订单处理错误:', error);
    return {
      success: false,
      errorMsg: '支付处理异常'
    };
  }
});

// 取消订单
Mock.mock('/api/order/cancel', 'post', (options) => {
  const { body } = options;
  const { orderId, reason = '用户取消' } = JSON.parse(body);
  const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: '订单不存在'
    };
  }
  
  // 更新订单状态
  orders[orderIndex].status = 3; // 已取消
  orders[orderIndex].cancelReason = reason;
  
  // 保存数据
  saveOrders();
  
  return {
    success: true,
    data: true
  };
});

// 取消订单（新增接口，与API接口路径匹配）
Mock.mock(/\/api\/order\/cancel\/\d+/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/order\/cancel\/(\d+)/)[1]);
  const { body } = options;
  const data = body ? JSON.parse(body) : {};
  const reason = data.reason || '用户取消';
  
  // 获取当前登录用户ID
  const userPhone = getUserPhoneFromToken();
  
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: '订单不存在'
    };
  }
  
  // 验证订单所属用户
  if (orders[orderIndex].userPhone !== userPhone) {
    return {
      success: false,
      errorMsg: '无权操作此订单'
    };
  }
  
  // 更新订单状态
  orders[orderIndex].status = 3; // 已取消
  orders[orderIndex].cancelReason = reason;
  
  // 保存数据
  saveOrders();
  
  return {
    success: true,
    data: true
  };
});

// 确认收货
Mock.mock('/api/order/confirm', 'post', (options) => {
  const { body } = options;
  const { orderId } = JSON.parse(body);
  const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: '订单不存在'
    };
  }
  
  // 更新订单状态
  orders[orderIndex].status = 5; // 已完成
  
  // 保存数据
  saveOrders();
  
  return {
    success: true,
    data: true
  };
});

// 确认收货（新增接口，与API接口路径匹配）
Mock.mock(/\/api\/order\/confirm\/\d+/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/order\/confirm\/(\d+)/)[1]);
  
  // 获取当前登录用户ID
  const userPhone = getUserPhoneFromToken();
  
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return {
      success: false,
      errorMsg: '订单不存在'
    };
  }
  
  // 验证订单所属用户
  if (orders[orderIndex].userPhone !== userPhone) {
    return {
      success: false,
      errorMsg: '无权操作此订单'
    };
  }
  
  // 更新订单状态
  orders[orderIndex].status = 5; // 已完成
  
  // 保存数据
  saveOrders();
  
  return {
    success: true,
    data: true
  };
});

export default {
  orders
};
