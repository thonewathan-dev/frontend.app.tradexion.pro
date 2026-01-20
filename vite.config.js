import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'tradexion.up.railway.app',
      '.railway.app',
      '.up.railway.app',
    ],
    // Disable local network access to prevent permission prompt
    strictPort: false,
  },
  build: {
    // Optimize build for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'charts': ['lightweight-charts'],
        },
      },
    },
    // Enable asset caching
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'lightweight-charts'],
  },
});
