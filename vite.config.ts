import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    rollupOptions: {
      input: 'build-entry.html',
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes('style.css')) {
            return 'assets/app.css'
          }

          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/app.css'
          }

          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
