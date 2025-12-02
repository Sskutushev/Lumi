import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 10000, // Увеличиваем таймаут до 10 секунд
    hookTimeout: 15000, // Увеличиваем таймаут для хуков
    clearMocks: true, // Автоматически очищаем моки после каждого теста
  },
});
