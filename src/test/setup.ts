import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { supabaseMock } from '../__mocks__/supabase';

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
