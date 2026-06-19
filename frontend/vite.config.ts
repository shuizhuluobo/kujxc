import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.png'],
      manifest: {
        name: '工单管理系统',
        short_name: '工单系统',
        description: '工单管理与追踪系统',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // 增加文件大小限制到 5MB
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Enable LAN access
    allowedHosts: true, // 允许局域网 IP 访问（开发环境）
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus') || id.includes('@element-plus/icons-vue')) {
              return 'element-plus'
            }
            if (id.includes('vant')) {
              return 'vant'
            }
            if (id.includes('vue') && !id.includes('vue-router') && !id.includes('pinia')) {
              return 'vue-core'
            }
            if (id.includes('vue-router')) {
              return 'vue-router'
            }
            if (id.includes('pinia')) {
              return 'pinia'
            }
            if (id.includes('md-editor-v3')) {
              return 'md-editor'
            }
            if (id.includes('lowlight')) {
              return 'lowlight'
            }
            if (id.includes('@milkdown')) {
              return 'milkdown'
            }
            if (id.includes('@tiptap')) {
              return 'tiptap'
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs'
            }
            if (id.includes('gsap')) {
              return 'gsap'
            }
            if (id.includes('marked')) {
              return 'markdown-utils'
            }
            if (id.includes('vue-cropper')) {
              return 'vue-cropper'
            }
            if (id.includes('@vueuse')) {
              return 'vueuse'
            }
            if (id.includes('axios')) {
              return 'axios'
            }
            if (id.includes('dayjs')) {
              return 'dayjs'
            }
            if (id.includes('pinyin-pro')) {
              return 'pinyin'
            }
            if (id.includes('prismjs')) {
              return 'prismjs'
            }
            if (id.includes('sortablejs')) {
              return 'sortablejs'
            }
            if (id.includes('refractor') || id.includes('hast-util-to-text')) {
              return 'markdown-utils'
            }
            if (id.includes('unist-util')) {
              return 'markdown-utils'
            }
            if (id.includes('micromark') || id.includes('mdast-util')) {
              return 'markdown-utils'
            }
            if (id.includes('micromark-')) {
              return 'markdown-utils'
            }
          }
        },
        // 启用更好的代码分割策略
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        codeSplitting: true,
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
