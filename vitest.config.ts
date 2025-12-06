import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for Vitest
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000, // Increased timeout for tests - 15 seconds
    hookTimeout: 20000, // Increased timeout for hooks - 20 seconds
    clearMocks: true,
    restoreMocks: true,
    reporters: ['verbose'], // Detailed output for debugging
    logHeapUsage: true, // Log memory usage
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'build/**'], // Exclude e2e tests
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
