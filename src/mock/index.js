import Mock from 'mockjs'

// 设置延迟时间
Mock.setup({
  timeout: '200-600'
})

// 引入用户模块的mock数据
import './user'

// 引入商铺模块的mock数据
import './shop'

// 引入商品模块的mock数据
import './goods'

// 引入订单模块的mock数据
import './order'

// 引入评价模块的mock数据
import './comment'

// 引入地址模块的mock数据
import './address'

export default Mock