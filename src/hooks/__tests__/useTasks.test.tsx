// src/hooks/__tests__/useTasks.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTasks } from '../queries/useTasks';
import { tasksAPI } from '../../lib/api/tasks.api';

// Мокаем API
vi.mock('../../lib/api/tasks.api');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTasks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tasks successfully', async () => {
    const mockTasks = [
      {
        id: '1',
        user_id: 'user1',
        title: 'Test Task',
        completed: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    (tasksAPI.getAll as vi.Mock).mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks('user1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 });

    expect(result.current.data).toEqual(mockTasks);
    expect(tasksAPI.getAll).toHaveBeenCalledWith('user1');
  });

  it('should handle error when fetching tasks', async () => {
    const mockError = new Error('Failed to fetch tasks');
    (tasksAPI.getAll as vi.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks('user1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });

  it('should not fetch tasks if userId is empty', () => {
    (tasksAPI.getAll as vi.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useTasks(''), { wrapper });

    expect(tasksAPI.getAll).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
