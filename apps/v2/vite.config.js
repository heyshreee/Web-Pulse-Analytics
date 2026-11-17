import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

const backendTarget = process.env.BACKEND_URL || 'http://localhost:3000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/api/track': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})