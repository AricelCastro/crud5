import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,   // expone en 0.0.0.0 → accesible desde la red local
    port: 5173,
  },
})
