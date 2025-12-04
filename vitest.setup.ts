import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Установить фиксированный часовой пояс для тестов
process.env.TZ = 'UTC';

// Моки для DOM API, которые могут вызывать проблемы
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // устаревший
    removeListener: vi.fn(), // устаревший
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Моки для IntersectionObserver (используется в lazy loading)
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Моки для ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Моки для Crypto API
if (!crypto.subtle) {
  Object.defineProperty(crypto, 'subtle', {
    value: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  });
}

// Очистить моки после каждого теста
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});
