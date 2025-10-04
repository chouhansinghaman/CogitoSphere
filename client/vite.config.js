import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // makes asset paths relative (important for Vercel)
  server: {
    historyApiFallback: true, // enables React Router fallback in dev
  },
  preview: {
    historyApiFallback: true, // ensures the same in vite preview
  },
})
