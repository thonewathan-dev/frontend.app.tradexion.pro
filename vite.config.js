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
    port: process.env.PORT || 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'www.tradexion.pro',
      '.railway.app',
      '.up.railway.app',
      'localhost',
      'tradexion.pro',
      'www.tradexion.pro',
      'admin.tradexion.pro',
      'backend.tradexion.pro',
    ],
    strictPort: false,
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR on Railway
    },
  },
  preview: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'www.tradexion.pro',
      '.railway.app',
      '.up.railway.app',
      'tradexion.pro',
      'www.tradexion.pro',
      'admin.tradexion.pro',
      'backend.tradexion.pro',
    ],
    // Disable local network access to prevent permission prompt
    strictPort: false,
  },
  build: {
    // Optimize build for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          'charts': ['echarts'],
        },
        // Add hash to filenames for cache-busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Enable asset caching
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 1000,
    // Generate manifest for cache-busting
    manifest: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'echarts'],
  },
  // Ensure service worker and manifest are copied to dist
  publicDir: 'public',
});
