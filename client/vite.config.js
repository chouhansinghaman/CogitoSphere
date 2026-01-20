import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  server: {
    historyApiFallback: true,
    // 👇 PROXY MUST BE INSIDE THE SERVER OBJECT
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Ensure this matches your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    historyApiFallback: true, 
  },
});