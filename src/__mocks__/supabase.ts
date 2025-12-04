// src/__mocks__/supabase.ts
import { vi } from 'vitest';

// --- Realtime Mock ---
const realtimeChannelMock = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((callback) => {
    // Вызываем колбэк с 'SUBSCRIBED' для имитации успешной подписки
    if (callback) {
      callback('SUBSCRIBED', null);
    }
    return {
      unsubscribe: vi.fn(),
    };
  }),
  unsubscribe: vi.fn().mockResolvedValue('OK'),
};

// --- Query Builder Mock ---
const queryBuilderMock = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: {}, error: null }),
  then: vi.fn((resolve) => resolve({ data: [], error: null })), // Для await
};

// --- Storage Mock ---
const storageBuilderMock = {
  upload: vi.fn().mockResolvedValue({ data: { path: '/path/to/file.png' }, error: null }),
  download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://mock.url/file.png' } })),
  remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
};

// --- Auth Mock ---
const authMock = {
  getSession: vi.fn().mockResolvedValue({
    data: {
      session: {
        user: { id: 'test-user-id', email: 'test@example.com' },
      },
    },
    error: null,
  }),
  onAuthStateChange: vi.fn((callback) => {
    // Имитируем начальное событие SIGNED_IN
    callback('INITIAL_SESSION', { user: { id: 'test-user-id', email: 'test@example.com' } });
    return {
      data: {
        subscription: {
          id: 'mock-subscription-id',
          unsubscribe: vi.fn(),
          callback: callback,
        },
      },
      error: null,
    };
  }),
  signInWithPassword: vi.fn().mockResolvedValue({
    data: { user: { id: 'test-user-id' }, session: {} },
    error: null,
  }),
  signUp: vi.fn().mockResolvedValue({
    data: { user: { id: 'new-user-id' }, session: {} },
    error: null,
  }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
};

// --- Main Supabase Mock Object ---
export const supabaseMock = {
  from: vi.fn(() => queryBuilderMock),
  storage: {
    from: vi.fn(() => storageBuilderMock),
  },
  auth: authMock,
  realtime: {
    channel: vi.fn(() => realtimeChannelMock),
    removeChannel: vi.fn(),
    getChannels: vi.fn(() => [realtimeChannelMock]),
  },
  rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
};
