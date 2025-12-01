// src/lib/__mocks__/supabase.ts
import { vi } from 'vitest';

// Это мок-объект, который имитирует цепочку вызовов Supabase
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  // .single() обычно возвращает промис с результатом
  single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
  // Сама цепочка вызовов также может быть await-нута
  then: vi.fn((resolve) => resolve({ data: [{ id: 'mock-id' }], error: null })),
};

// Мокаем storage
const mockStorageBuilder = {
  upload: vi.fn().mockResolvedValue({ error: null }),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://mock.url/avatar.png' } })),
};

// Главный мок-объект supabase
export const supabase = {
  from: vi.fn(() => mockQueryBuilder),
  auth: {
    // Здесь можно будет добавить моки для функций аутентификации, если они понадобятся
  },
  storage: {
    from: vi.fn(() => mockStorageBuilder),
  },
};
