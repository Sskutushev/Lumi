// src/lib/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { shouldRetry, getRetryDelay } from '../utils/retryPolicy';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => shouldRetry(error, failureCount - 1),
      retryDelay: (failureCount) => getRetryDelay(failureCount - 1),
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    },
    mutations: {
      // By default, mutations are not retried, but it can be enabled for safe operations
      retry: (failureCount, error) => {
        // Retry mutations only for network errors and 5xx server errors
        return shouldRetry(error, failureCount - 1);
      },
      retryDelay: (failureCount) => getRetryDelay(failureCount - 1),
    },
  },
});
