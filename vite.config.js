import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // Or whatever framework plugin you're using
import tailwindcssPostcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), // Or your framework's plugin
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcssPostcss,
        autoprefixer,
      ],
    },
  },
})
