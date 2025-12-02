import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { supabaseMock } from '../__mocks__/supabase';

// Мокаем BroadcastChannel для тестов
if (typeof window !== 'undefined') {
  // Create a mock BroadcastChannel for tests
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage(_message: any) {
      // Do nothing in tests
    }

    close() {
      // Do nothing in tests
    }

    addEventListener(
      _type: string,
      _listener: EventListener,
      _options?: boolean | AddEventListenerOptions
    ) {
      // Do nothing in tests
    }

    removeEventListener(
      _type: string,
      _listener: EventListener,
      _options?: boolean | EventListenerOptions
    ) {
      // Do nothing in tests
    }

    start() {
      // Do nothing in tests
    }

    stop() {
      // Do nothing in tests
    }
  }

  Object.defineProperty(window, 'BroadcastChannel', {
    writable: true,
    value: MockBroadcastChannel,
  });

  // Мокаем navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
}

// Глобально мокаем модуль, который экспортирует клиент Supabase
vi.mock('../src/lib/supabase', () => ({
  supabase: supabaseMock,
}));

// Этот хук будет выполняться после каждого теста
afterEach(() => {
  // Очищает DOM
  cleanup();
  // Сбрасывает все моки, чтобы тесты были изолированы друг от друга
  vi.resetAllMocks();
});
