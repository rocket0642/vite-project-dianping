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
        target: 'http://localhost:8081', // 确保这是正确的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 添加以下配置以处理上传请求
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
              // 保持原始的 content-type
              proxyReq.setHeader('Content-Type', req.headers['content-type']);
            }
          });
        }
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
