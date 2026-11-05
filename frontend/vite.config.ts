import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ponytail: abierto para tuneles (ngrok). Cerrar si se expone permanente.
    allowedHosts: true,
    proxy: {
      // websocket de monitorsol
      '/ws': {
        target: 'http://localhost:8001',
        ws: true,
        changeOrigin: true,
      },
      // monitor = servicio Python (monitorsol) en :8001, expone /monitor/*
      '/api/monitor': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/monitor/, '/monitor'),
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
