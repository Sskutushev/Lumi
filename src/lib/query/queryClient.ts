// src/lib/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => {
        // Экспоненциальная задержка: 1с, 2с, 4с
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
      refetchOnWindowFocus: false, // Отключаем автоматический рефетч при фокусе на окне
    },
  },
});
