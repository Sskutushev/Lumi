import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { supabaseMock } from '../__mocks__/supabase';

// Mock BroadcastChannel for tests
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

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
}

// Globally mock the module that exports the Supabase client
vi.mock('../src/lib/supabase', () => ({
  supabase: supabaseMock,
}));

// This hook will run after each test
afterEach(() => {
  // Cleans up the DOM
  cleanup();
  // Resets all mocks to isolate tests from each other
  vi.resetAllMocks();
});
