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

用户注册、登录和信息管理。

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

**1.2 用户登录**  

- 请求方式：`POST /user/login`

```java
@PostMapping("/login")
public Result login(@RequestBody LoginFormDTO loginForm) {

    return userService.login(loginForm);
}

@Data
public class LoginFormDTO {
    private String phone;
    private String code;
    private String password;
}
```

- 验证码登录请求参数：

  ```json
  {
    "phone": "13800138000",  // 手机号
    "code": "123456"         // 验证码
  }
  ```

- 密码登录请求参数：

  ```json
  {
    "phone": "13800138000",  // 手机号
    "password": "123456"     // 密码
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "nickName": "用户昵称",
      "icon": "头像地址",
      "token": "jwt令牌"
    }
  }
  ```

**1.3 获取当前用户信息**  

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

**1.4 查询用户详情**  

- 请求方式：`GET /user/info/{id}`
- 路径参数：

  ```
  id: long  // 用户ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "introduction": "个人介绍",
      "fans": 10,
      "followee": 20,
      "gender": 1,
      "birthday": "2000-01-01"
    }
  }
  ```

**1.5 更新用户信息**

- 请求方式：`PUT /user/info`
          `PUT /user/update`

``` java
    @PutMapping("/info")
    public Result update(@RequestBody UserInfo userInfo) {
        // 更新用户信息
        return userService.update(userInfo);
    }

    // 头像和昵称在user表里，修改头像和昵称
    @PutMapping("/update")
    public Result update(@RequestBody User user) {
        // 更新用户信息
        return userService.updateUser(user);
    }

    public class UserInfo implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * 主键，用户id
         */
        @TableId(value = "user_id", type = IdType.AUTO)
        private Long userId;

        /**
         * 城市名称
         */
        private String city;

        /**
         * 个人介绍，不要超过128个字符
         */
        private String introduce;

        /**
         * 粉丝数量
         */
        private Integer fans;

        /**
         * 关注的人的数量
         */
        private Integer followee;

        /**
         * 性别，0：男，1：女
         */
        private Boolean gender;

        /**
         * 生日
         */
        private LocalDate birthday;

        /**
         * 积分
         */
        private Integer credits;

        /**
         * 会员级别，0~9级,0代表未开通会员
         */
        private Boolean level;

        /**
         * 创建时间
         */
        private LocalDateTime createTime;

        /**
         * 更新时间
         */
        private LocalDateTime updateTime;
    }
```

- 请求参数：

  ```json
  {
    "id": 1,
    "nickName": "用户昵称",
    "icon": "头像地址",
    "gender": 1,
    "birthday": "2000-01-01"
  }

### 2. 商铺模块

商铺信息管理、商铺类型管理、商铺缓存策略。

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

订单创建与管理。

#### 接口详情

**5.1 创建订单**  

- 请求方式：`POST /order/create`
- 请求参数：

  ```json
  {
    "goodsId": 1,
    "count": 2
  }
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": 123456789  // 订单ID
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

- 返回示例：

  ```json
  {
    "success": true,
    "data": null
  }
  ```

**5.3 查询订单列表**  

- 请求方式：`GET /order/list`
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
        "status": 1,
        "createTime": "2022-01-01 12:00:00",
        "payTime": "2022-01-01 12:05:00"
      }
    ]
  }
  ```

**5.4 查询订单状态**  

- 请求方式：`GET /order/status/{orderId}`
- 路径参数：

  ```
  orderId: long  // 订单ID
  ```

- 返回示例：

  ```json
  {
    "success": true,
    "data": {
      "id": 123456789,
      "userId": 1,
      "goodsId": 1,
      "goodsName": "商品名称",
      "count": 2,
      "amount": 19800,
      "status": 1,  // 0-未支付，1-已支付，2-已取消
      "createTime": "2022-01-01 12:00:00",
      "payTime": "2022-01-01 12:05:00"
    }
  }
  ```

## 特色功能

### 1. 分布式锁

项目使用Redis实现分布式锁，解决高并发场景下的数据一致性问题，如秒杀活动中的库存超卖。

### 2. 缓存策略

- 采用多级缓存策略提升查询性能
- 实现缓存更新和淘汰机制，保证数据一致性
- 解决缓存穿透、缓存击穿、缓存雪崩问题

### 3. 异步消息队列

使用RabbitMQ实现异步消息处理，提高系统吞吐量，解耦业务逻辑。

### 4. 定时任务

实现定时任务处理，如优惠券过期处理、订单超时处理等。

## 环境配置

### 数据库配置

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/dp?useSSL=false&serverTimezone=UTC
    username: root
    password: ******
```

### Redis配置

```yaml
spring:
  redis:
    host: 192.168.11.20
    port: 6379
    password: ******
    lettuce:
      pool:
        max-active: 10
        max-idle: 10
        min-idle: 1
```

### RabbitMQ配置

```yaml
spring:
  rabbitmq:
    host: 192.168.11.20
    port: 5672
    username: ******
    password: ******
    virtual-host: /
