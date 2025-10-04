import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: './',
  server: {
    historyApiFallback: true,
=======
  base: './', // makes asset paths relative (important for Vercel)
  server: {
    historyApiFallback: true, // enables React Router fallback in dev
  },
  preview: {
    historyApiFallback: true, // ensures the same in vite preview
>>>>>>> aa731b84719da9eae40d9438f2338cbf1896e076
  },
})
