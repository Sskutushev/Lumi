// src/hooks/__tests__/useCreateTask.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateTask } from '../mutations/useCreateTask';
import { tasksAPI } from '../../lib/api/tasks.api';
import { act } from 'react-dom/test-utils';

// Мокаем API
jest.mock('../../lib/api/tasks.api');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCreateTask Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task successfully', async () => {
    const mockTaskData = {
      user_id: 'user1',
      title: 'New Task',
      completed: false,
    };

    const mockCreatedTask = {
      id: 'task1',
      ...mockTaskData,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    (tasksAPI.create as jest.Mock).mockResolvedValue(mockCreatedTask);

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    await act(async () => {
      result.current.mutate(mockTaskData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(tasksAPI.create).toHaveBeenCalledWith(mockTaskData);
    expect(result.current.data).toEqual(mockCreatedTask);
  });

  it('should handle error when creating task', async () => {
    const mockTaskData = {
      user_id: 'user1',
      title: 'New Task',
      completed: false,
    };

    const mockError = new Error('Failed to create task');
    (tasksAPI.create as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    await act(async () => {
      result.current.mutate(mockTaskData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should be defined', () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
