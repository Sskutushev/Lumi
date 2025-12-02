import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false, // Не открывать автоматически
      template: 'treemap', // Тип визуализация: treemap, sunburst, network
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Стратегия кэширования для API вызовов
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 минут
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Lumi Todo',
        short_name: 'Lumi',
        description: 'Productivity application with advanced task management',
        theme_color: '#818cf8',
        background_color: '#0f172a',
        display: 'standalone',
        icon: 'src/assets/images/logo.png',
        start_url: '/',
        orientation: 'portrait',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    sourcemap: false, // Отключаем sourcemaps в production для уменьшения размера
    cssCodeSplit: false, // Объединяем CSS в один файл
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'sonner'],
          'i18n-vendor': ['react-i18next', 'i18next'],
        },
        // Оптимизируем имена чанков
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: function (assetInfo) {
          var _a;
          if (
            (_a = assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.name) === null ||
            _a === void 0
              ? void 0
              : _a.endsWith('.css')
          ) {
            return 'assets/[name].[hash].[ext]';
          }
          return 'assets/[name].[hash].[ext]';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Оптимизации esbuild
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    pure: ['console.log', 'console.debug', 'console.info'], // Удаляем указанные вызовы из production сборки
  },
  define: {
    // Удаляем отладочную информацию в production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
