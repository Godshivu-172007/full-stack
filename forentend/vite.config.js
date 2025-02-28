import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  server: {
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    } : {
      '/api': {
        target: 'https://full-stack-mo36.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  plugins: [react()],
}));
