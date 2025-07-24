import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000' // ตรวจสอบให้ backend รันที่พอร์ต 5000 จริงๆ
    }
  }
})
