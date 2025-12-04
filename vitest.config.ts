import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 10000, // Increase timeout to 10 seconds
    hookTimeout: 15000, // Increase timeout for hooks
    clearMocks: true, // Automatically clear mocks after each test
    teardownTimeout: 10000, // Increase timeout for teardown
    isolate: true, // Isolate tests from each other
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
