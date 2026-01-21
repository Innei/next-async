import { resolve } from 'path'
import { presetAttributify, presetWind } from 'unocss'
import unoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  plugins: [
    unoCSS({
      presets: [
        presetWind({
          dark: 'media',
        }),
        presetAttributify(),
      ],
    }),
  ],
  root: resolve(__dirname, './example'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, './example/index.html'),
      },
    },
  },
})
