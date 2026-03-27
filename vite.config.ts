import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/smartleo/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/app-icon.svg'],
      manifest: {
        id: '/smartleo/',
        name: 'SmartLeo 儿童学习',
        short_name: 'SmartLeo',
        description: '一个适合儿童启蒙学习的移动端 PWA 应用。',
        theme_color: '#7c9cff',
        background_color: '#fffaf1',
        display: 'standalone',
        scope: '/smartleo/',
        start_url: '/smartleo/',
        icons: [
          {
            src: '/smartleo/icons/app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
