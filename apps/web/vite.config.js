import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
            return 'react-vendor';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('@radix-ui')) {
            return 'radix';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date';
          }

          if (id.includes('recharts')) {
            return 'charts';
          }

          if (id.includes('pocketbase')) {
            return 'pocketbase';
          }

          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
