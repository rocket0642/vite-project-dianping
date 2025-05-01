## 统一响应格式

系统所有接口都使用统一的响应格式：

```json
{
  "success": true|false,      // 操作是否成功
  "data": object,             // 返回的数据
  "errorMsg": "错误信息",      // 错误提示，success为false时才有
  "total": 100                // 分页查询时的总记录数
}
```

## 核心功能模块

### 1. 用户模块

用户注册、登录、信息管理、登出等功能。

#### 接口详情

**1.1 发送手机验证码**  

- 请求方式：`POST /user/code`
- 请求参数：

  ```
  phone: string  // 手机号码
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "验证码发送成功"
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "手机号格式错误！"
  }
  ```

**1.2 用户注册**

- 请求方式：`POST /user/register`
- 请求头：

  ```
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "phone": "13800138000",  // 手机号
    "code": "123456",        // 验证码
    "password": "your_password" // 密码
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "jwt令牌"  // 注册成功后自动登录，返回token
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "验证码错误"
  }
  ```

**1.3 用户登录**  

- 请求方式：`POST /user/login`
- 请求头：

  ```
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "phone": "13800138000",  // 手机号
    "code": "123456"         // 验证码登录
  }
  ```

  或

  ```json
  {
    "phone": "13800138000",     // 手机号
    "password": "your_password" // 密码登录
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "jwt令牌"
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "用户不存在，请注册"
  }
  ```

**1.4 用户登出**

- 请求方式：`POST /user/logout`
- 请求参数：

  ```
  phone: string  // 手机号码
  ```

- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "登出成功"
  }
  ```

**1.5 获取当前用户信息**  

- 请求方式：`GET /user/me`
- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "nickName": "用户昵称",
      "icon": "头像地址"
    }
  }
  ```

**1.6 查询用户详情**  

- 请求方式：`GET /user/info/{id}`
- 路径参数：

  ```
  id: long  // 用户ID
  ```

- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "city": "杭州",
      "introduce": "个人介绍",
      "fans": 10,
      "followee": 20,
      "gender": true,  // true-女，false-男
      "birthday": "2000-01-01",
      "credits": 100,
      "level": false   // false-未开通会员，true-已开通
    }
  }
  ```

**1.7 更新用户详细信息**

- 请求方式：`PUT /user/info`
- 请求头：

  ```
  Authorization: token值
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "userId": 1,
    "city": "杭州",
    "introduce": "这是我的新介绍",
    "gender": true,
    "birthday": "2000-01-01"
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "更新成功"
  }
  ```

**1.8 更新用户基本信息**

- 请求方式：`PUT /user/update`
- 请求头：

  ```
  Authorization: token值
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "id": 1,
    "nickName": "新昵称",
    "icon": "新头像地址"
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": "更新成功"
  }
  ```

### 2. 商铺模块

商铺信息管理、商铺类型管理、商铺搜索、地理位置排序等功能。

#### 接口详情

**2.1 查询商铺信息**  

- 请求方式：`GET /shop/{id}`
- 路径参数：

  ```
  id: long  // 商铺ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "商铺名称",
      "typeId": 1,
      "images": "图片地址",
      "area": "地区",
      "address": "详细地址",
      "x": 120.123456,
      "y": 30.123456,
      "avgPrice": 100,
      "sold": 200,
      "comments": 300,
      "score": 4.5,
      "openHours": "10:00-22:00",
      "createTime": "2022-01-01 12:00:00",
      "updateTime": "2022-01-02 12:00:00"
    }
  }
  ```

**2.2 按类型查询商铺**  

- 请求方式：`GET /shop/of/type`
- 请求参数：

  ```
  typeId: int      // 商铺类型ID
  current: int     // 当前页码，默认1
  x: double        // 经度，可选
  y: double        // 纬度，可选
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "商铺名称",
        "typeId": 1,
        "images": "图片地址",
        "area": "地区",
        "address": "详细地址",
        "x": 120.123456,
        "y": 30.123456,
        "avgPrice": 100,
        "sold": 200,
        "comments": 300,
        "score": 4.5,
        "openHours": "10:00-22:00",
        "distance": 1500  // 距离，单位米
      }
    ],
    "total": 20
  }
  ```

**2.3 新增商铺**  

- 请求方式：`POST /shop`
- 请求头：

  ```
  Authorization: token值
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "name": "商铺名称",
    "typeId": 1,
    "images": "图片地址",
    "area": "地区",
    "address": "详细地址",
    "x": 120.123456,
    "y": 30.123456,
    "avgPrice": 100,
    "openHours": "10:00-22:00"
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 1  // 新增商铺的ID
  }
  ```

**2.4 更新商铺**  

- 请求方式：`PUT /shop`
- 请求头：

  ```
  Authorization: token值
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "id": 1,
    "name": "商铺名称",
    "typeId": 1,
    "images": "图片地址",
    "area": "地区",
    "address": "详细地址",
    "x": 120.123456,
    "y": 30.123456,
    "avgPrice": 100,
    "openHours": "10:00-22:00"
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": null
  }
  ```

**2.5 获取商铺类型列表**  

- 请求方式：`GET /shop-type/list`
- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "美食",
        "icon": "图标地址",
        "sort": 1
      },
      {
        "id": 2,
        "name": "KTV",
        "icon": "图标地址",
        "sort": 2
      }
    ]
  }
  ```

**2.6 根据关键词搜索商铺**  

- 请求方式：`GET /shop/search`
- 请求参数：

  ```
  keyword: string  // 搜索关键词
  current: int     // 当前页码，默认1
  x: double        // 经度，可选
  y: double        // 纬度，可选
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "商铺名称",
        "typeId": 1,
        "typeName": "美食",
        "images": "图片地址",
        "area": "地区",
        "address": "详细地址",
        "x": 120.123456,
        "y": 30.123456,
        "avgPrice": 100,
        "sold": 200,
        "comments": 300,
        "score": 4.5,
        "openHours": "10:00-22:00",
        "distance": 1500  // 距离，单位米
      }
    ],
    "total": 5
  }
  ```

**2.7 根据商铺名称关键词查询商铺**

- 请求方式：`GET /shop/name`
- 请求参数：

  ```
  name: string     // 商铺名称关键词
  current: int     // 当前页码，默认1
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "商铺名称",
        "typeId": 1,
        "typeName": "美食",
        "images": "图片地址",
        "area": "地区",
        "address": "详细地址",
        "avgPrice": 100,
        "sold": 200,
        "comments": 300,
        "score": 4.5
      }
    ],
    "total": 5
  }
  ```

### 3. 优惠券模块

普通优惠券、秒杀优惠券、异步下单。

#### 接口详情

**3.1 新增普通优惠券**  

- 请求方式：`POST /voucher`
- 请求参数：

  ```json
  {
    "shopId": 1,           // 商铺ID
    "title": "100元代金券", // 优惠券标题
    "subTitle": "周一至周五可用", // 副标题
    "rules": "使用规则",    // 使用规则
    "payValue": 8000,      // 支付金额，单位分
    "actualValue": 10000,  // 实际价值，单位分
    "type": 0              // 优惠券类型：0-普通券，1-秒杀券
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 1  // 新增优惠券的ID
  }
  ```

**3.2 新增秒杀优惠券**  

- 请求方式：`POST /voucher/seckill`
- 请求参数：

  ```json
  {
    "shopId": 1,           // 商铺ID
    "title": "100元代金券", // 优惠券标题
    "subTitle": "周一至周五可用", // 副标题
    "rules": "使用规则",    // 使用规则
    "payValue": 8000,      // 支付金额，单位分
    "actualValue": 10000,  // 实际价值，单位分
    "type": 1,             // 优惠券类型：0-普通券，1-秒杀券
    "stock": 100,          // 库存
    "beginTime": "2022-01-01T10:00:00", // 开始时间
    "endTime": "2022-01-01T22:00:00"    // 结束时间
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 1  // 新增优惠券的ID
  }
  ```

**3.3 查询店铺优惠券**  

- 请求方式：`GET /voucher/list/{shopId}`
- 路径参数：

  ```
  shopId: long  // 商铺ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "shopId": 1,
        "title": "100元代金券",
        "subTitle": "周一至周五可用",
        "rules": "使用规则",
        "payValue": 8000,
        "actualValue": 10000,
        "type": 1,
        "stock": 100,
        "beginTime": "2022-01-01T10:00:00",
        "endTime": "2022-01-01T22:00:00"
      }
    ]
  }
  ```

**3.4 秒杀下单**  

- 请求方式：`POST /voucher-order/seckill/{id}`
- 路径参数：

  ```
  id: long  // 优惠券ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 123456789  // 订单ID
  }
  ```

### 4. 商品模块

商品信息管理与查询。

#### 接口详情

**4.1 查询商品信息**  

- 请求方式：`GET /goods/{id}`
- 路径参数：

  ```
  id: long  // 商品ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "商品名称",
      "price": 9900,
      "description": "商品描述",
      "imageUrl": "图片地址",
      "stock": 100
    }
  }
  ```

**4.2 添加商品**  

- 请求方式：`POST /goods`
- 请求参数：

  ```json
  {
    "name": "商品名称",
    "price": 9900,
    "description": "商品描述",
    "imageUrl": "图片地址",
    "stock": 100
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 1  // 新增商品的ID
  }
  ```

**4.3 更新商品**  

- 请求方式：`PUT /goods`
- 请求参数：

  ```json
  {
    "id": 1,
    "name": "商品名称",
    "price": 9900,
    "description": "商品描述",
    "imageUrl": "图片地址",
    "stock": 100
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": null
  }
  ```

### 5. 订单模块

订单创建、支付、查询和管理功能。

#### 接口详情

**5.1 创建订单**  

- 请求方式：`POST /order/create`
- 请求头：

  ```
  Authorization: token值
  Content-Type: application/json
  ```

- 请求参数：

  ```json
  {
    "goodsId": 1,    // 商品ID
    "count": 2       // 商品数量
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 123456789  // 订单ID
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "库存不足"
  }
  ```

**5.2 支付订单**  

- 请求方式：`POST /order/pay/{orderId}`
- 路径参数：

  ```
  orderId: long  // 订单ID
  ```

- 请求参数：

  ```
  payType: int  // 支付方式，1-微信支付，2-支付宝
  ```

- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": null
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "支付失败"
  }
  ```

**5.3 查询订单列表**  

- 请求方式：`GET /order/list`
- 请求头：

  ```
  Authorization: token值
  ```

- 请求参数：

  ```
  status: int   // 订单状态，可选：0-全部，1-未支付，2-已支付，3-已取消
  current: int  // 当前页码，默认1
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 123456789,
        "userId": 1,
        "goodsId": 1,
        "goodsName": "商品名称",
        "count": 2,
        "amount": 19800,
        "status": 1,       // 订单状态：1-未支付，2-已支付，3-已取消，4-已完成
        "createTime": "2022-01-01 12:00:00",
        "payTime": "2022-01-01 12:05:00",
        "payType": 1       // 支付方式：1-微信支付，2-支付宝
      }
    ],
    "total": 10
  }
  ```

**5.4 查询订单详情**  

- 请求方式：`GET /order/status/{orderId}`
- 路径参数：

  ```
  orderId: long  // 订单ID
  ```

- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 123456789,
      "userId": 1,
      "shopId": 10,        // 商铺ID
      "goodsId": 1,
      "goodsName": "商品名称",
      "count": 2,
      "goodsPrice": 9900,  // 商品单价，单位分
      "amount": 19800,     // 总金额，单位分
      "status": 2,         // 订单状态：1-未支付，2-已支付，3-已取消，4-已完成
      "createTime": "2022-01-01 12:00:00",
      "payTime": "2022-01-01 12:05:00",
      "payType": 1         // 支付方式：1-微信支付，2-支付宝
    }
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "订单不存在"
  }
  ```

**5.5 取消订单**

- 请求方式：`POST /order/cancel/{orderId}`
- 路径参数：

  ```
  orderId: long  // 订单ID
  ```

- 请求头：

  ```
  Authorization: token值
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": null
  }
  ```

- 错误示例：

  ```json
  {
    "success": false,
    "errorMsg": "订单已支付，无法取消"
  }
  ```
