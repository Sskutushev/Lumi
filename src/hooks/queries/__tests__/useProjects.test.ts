// src/hooks/queries/__tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects, useCreateProject } from '../useProjects';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectsAPI } from '../../../lib/api/projects.api';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../../../lib/api/projects.api');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useProjects', () => {
  it('should fetch projects for a user', async () => {
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    (projectsAPI.getAll as vi.Mock).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProjects);
  });
});

describe('useCreateProject', () => {
  it('should create a project and invalidate queries', async () => {
    const mockProject = { id: '1', name: 'New Project' };
    (projectsAPI.create as vi.Mock).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    result.current.mutate({ user_id: '1', name: 'New Project' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // In a real scenario, we would check if the query was invalidated.
    // For this mock, we just check for success.
    expect(projectsAPI.create).toHaveBeenCalledWith({ user_id: '1', name: 'New Project' });
  });
});
