// src/hooks/mutations/__tests__/useUpdateTask.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateTask } from '../useUpdateTask';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tasksAPI } from '../../../lib/api/tasks.api';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../../../lib/api/tasks.api');

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUpdateTask', () => {
  it('should update a task and invalidate queries', async () => {
    const mockTask = { id: '1', title: 'Updated Task' };
    (tasksAPI.update as vi.Mock).mockResolvedValue(mockTask);

    const { result } = renderHook(() => useUpdateTask(), { wrapper });

    result.current.mutate({ id: '1', data: { title: 'Updated Task' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(tasksAPI.update).toHaveBeenCalledWith('1', { title: 'Updated Task' });
    expect(queryClient.getQueryData(['tasks', '1'])).toEqual(mockTask);
  });
});
