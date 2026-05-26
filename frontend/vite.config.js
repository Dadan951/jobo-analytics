import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: '/',
    proxy: {
      '/auth':             { target: 'http://localhost:5000', changeOrigin: true },
      '/jobs':             { target: 'http://localhost:5000', changeOrigin: true },
      '/contents':         { target: 'http://localhost:5000', changeOrigin: true },
      '/activity-logs':    { target: 'http://localhost:5000', changeOrigin: true },
      '/tickets':          { target: 'http://localhost:5000', changeOrigin: true },
      '/admin':            { target: 'http://localhost:5000', changeOrigin: true },
      '/scans':            { target: 'http://localhost:5000', changeOrigin: true },
      '/physical-objects': { target: 'http://localhost:5000', changeOrigin: true },
      '/subscriptions':    { target: 'http://localhost:5000', changeOrigin: true },
      '/jobo':             { target: 'http://localhost:5000', changeOrigin: true },
      '/webhook':          { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
