import Mock from 'mockjs'

// 从localStorage中获取评论数据
function getStoredComments() {
  try {
    const commentStore = JSON.parse(localStorage.getItem('comment-store') || '{}');
    return commentStore.comments || [];
  } catch (e) {
    console.error('获取存储的评论失败:', e);
    return [];
  }
}

// 保存评论数据到localStorage
function saveComments(comments) {
  try {
    const commentStore = JSON.parse(localStorage.getItem('comment-store') || '{}');
    commentStore.comments = comments;
    localStorage.setItem('comment-store', JSON.stringify(commentStore));
  } catch (e) {
    console.error('保存评论失败:', e);
  }
}

// 在comment.js中添加获取用户信息的函数
function getUserInfo() {
  try {
    const userStoreData = JSON.parse(localStorage.getItem('user-store') || '{}');
    return userStoreData.userInfo || {};
  } catch (e) {
    console.error('获取用户信息失败:', e);
    return {};
  }
}

// 模拟评价数据 - 导出以便其他模块使用
export const comments = [
  
]

// 提交评价
Mock.mock('/api/comment/submit', 'post', (options) => {
  const { body } = options
  const commentData = JSON.parse(body)
  
  // 获取当前评论列表
  const comments = getStoredComments()
  
  // 获取用户信息
  const userInfo = getUserInfo()
  
  // 生成新评价ID
  const newCommentId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1
  
  // 创建新评价，确保安全获取用户昵称
  const newComment = {
    id: newCommentId,
    ...commentData,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userNickName: userInfo.nickName || "匿名用户",
    userIcon: userInfo.icon || "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
  }
  
  // 添加到评论列表
  comments.push(newComment)
  
  // 保存到localStorage
  saveComments(comments)
  
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
  
  // 获取当前评论列表
  const comments = getStoredComments()
  
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
  const orderId = parseInt(options.url.match(/\/api\/comment\/check\/(\d+)/)[1]);
  
  // 获取当前评论列表
  const comments = getStoredComments()
  
  // 检查是否有该订单的评论
  const hasComment = comments.some(c => c.orderId === orderId);
  
  return {
    success: true,
    data: hasComment
  };
})

export default {
  comments
}
