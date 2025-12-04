// src/hooks/mutations/__tests__/useDeleteTask.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteTask } from '../useDeleteTask';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tasksAPI } from '../../../lib/api/tasks.api';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../../../lib/api/tasks.api');

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDeleteTask', () => {
  it('should delete a task and invalidate queries', async () => {
    (tasksAPI.delete as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTask(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(tasksAPI.delete).toHaveBeenCalledWith('1');
  });
});
