import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const target = env.VITE_API_BASE_URL || 'http://localhost:9000'
  const host = env.VITE_DEV_HOST || 'localhost'
  const port = Number(env.VITE_DEV_PORT) || 5173

  return {
    plugins: [vue()],

    define: {
      global: 'globalThis'
    },

    server: {
      host,
      port,

      proxy: {
        '/api': {
          target,
          changeOrigin: true
        },

        '/ws-chat': {
          target,
          changeOrigin: true,
          ws: true
        }
      }
    }
  }
})