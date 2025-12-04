import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфигурация для тестирования
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000, // Увеличенный таймаут для тестов - 15 секунд
    hookTimeout: 20000, // Увеличенный таймаут для хуков - 20 секунд
    clearMocks: true,
    restoreMocks: true,
    reporters: ['verbose'], // Подробный вывод для отладки зависаний
    logHeapUsage: true, // Логирование использования памяти
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
