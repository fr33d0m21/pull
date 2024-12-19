import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'pdf-vendor': ['@react-pdf/renderer'],
        },
      },
    },
    minify: process.env.VITE_BUILD_MINIFY === 'true',
    cssMinify: process.env.VITE_BUILD_MINIFY === 'true',
    chunkSizeWarningLimit: 1000,
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    disabled: process.env.NODE_ENV === 'production'
  },
});