import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // place Vite output inside the frontend folder so Vercel's config can find it
    // avoid writing outside the project root; use 'dist' to produce `frontend/dist`
    outDir: '../dist'
  }
})
