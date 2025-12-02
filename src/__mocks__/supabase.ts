// src/test/supabaseMock.ts
import { vi } from 'vitest';

// Создаем единый, реконфигурируемый мок для всей цепочки
export const queryBuilderMock = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  // Терминальные методы - они не возвращают 'this'
  single: vi.fn().mockResolvedValue({ data: null, error: null }), // Возвращаем промис с данными
  // 'then' для await-запросов, не заканчивающихся на .single()
  then: vi.fn().mockResolvedValue({ data: null, error: null }),
};

export const storageBuilderMock = {
  upload: vi.fn().mockResolvedValue({ error: null }),
  getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://mock.url/file.png' } }),
};

// Главный мок-объект, который будет подставляться вместо реального supabase
export const supabaseMock = {
  from: vi.fn(() => queryBuilderMock),
  storage: {
    from: vi.fn(() => storageBuilderMock),
  },
  rpc: vi.fn().mockReturnThis(),
};
