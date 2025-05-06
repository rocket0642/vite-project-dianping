import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'
import router from './router'
import './style.css'

// 导入mock数据（仅在开发环境使用）
// import './mock'

// 创建pinia实例并使用持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 创建Vue应用实例
const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
