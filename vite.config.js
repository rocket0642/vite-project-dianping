import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000, // 设置服务器端口为3000
    strictPort: true, // 如果端口被占用，则会直接退出而不是尝试下一个可用端口
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      external: [], // 不要将Element Plus图标设为外部依赖
      // 确保正确处理外部依赖
      output: {
        manualChunks: {
          'element-plus-icons': ['@element-plus/icons-vue']
        }
      }
    }
  }
})
