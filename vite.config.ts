import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    postcss: 'postcss.config.js'
  },
  build: {
    cssTarget: 'chrome61'
  }
})
