// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_TARGET = 'http://127.0.0.1:17890'

const API_PREFIXES = [
  '/astro',
  '/numerology',
  '/tarot',
  '/moon-phase',
  '/compatibility',
  '/ritual',
  '/chakra',
  '/runes',
  '/kabbalah',
  '/transits',
  '/crystal',
  '/palmistry',
  '/chat',
  '/knowledge',
  '/health',
  '/api',
]

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      API_PREFIXES.map(prefix => [prefix, { target: BACKEND_TARGET, changeOrigin: true }])
    ),
  },
})