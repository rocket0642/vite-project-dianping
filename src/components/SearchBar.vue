<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 搜索类型
const searchType = ref('shop') // 'shop' 或 'goods'

// 搜索关键词
const keyword = ref('')

/**
 * 执行搜索
 */
const handleSearch = () => {
  if (!keyword.value.trim()) return
  
  // 根据搜索类型执行不同的搜索
  if (searchType.value === 'shop') {
    router.push({
      path: '/search',
      query: { keyword: keyword.value, type: 'shop' }
    })
  } else {
    router.push({
      path: '/search',
      query: { keyword: keyword.value, type: 'goods' }
    })
  }
}

</script>

<template>
  <div class="search-bar">
    
    <div class="search-input-container">
      <el-input
        v-model="keyword"
        placeholder="搜索商品/商铺"
        @keyup.enter="handleSearch"
      >
        <template #suffix>
          <el-icon @click="handleSearch"><Search /></el-icon>
        </template>
      </el-input>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 20px;
}

.search-type-switch {
  display: flex;
  margin-right: 15px;
}

.type-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 8px;
  color: #666;
  transition: all 0.3s;
}

.type-option.active {
  background-color: #f0f9ff;
  color: #409EFF;
  font-weight: bold;
}

.type-option .el-icon {
  margin-right: 5px;
}

.search-input-container {
  flex: 1;
}

.search-input-container .el-input__inner {
  border-radius: 20px;
}

.search-input-container .el-icon {
  cursor: pointer;
  font-size: 18px;
  color: #909399;
}

.search-input-container .el-icon:hover {
  color: #409EFF;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    width: 100%;
    margin: 10px 0;
  }
  
  .search-type-switch {
    margin-bottom: 10px;
    width: 100%;
    justify-content: center;
  }
  
  .search-input-container {
    width: 100%;
  }
}
</style>