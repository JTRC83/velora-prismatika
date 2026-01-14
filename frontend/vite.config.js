// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cualquier petición que empiece por /astro se redirige al backend
      '/astro': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Hacemos lo mismo para el resto de servicios futuros
      '/numerology': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/tarot': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/moon-phase': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/compatibility': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/ritual': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/chakra': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/tarot': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      // ... puedes añadir más según los necesites
    }
  }
})