// src/hooks/queries/__tests__/useProfile.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProfile, useUpdateProfile } from '../useProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { profileAPI } from '../../../lib/api/profile.api';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../../../lib/api/profile.api');

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

describe('useProfile', () => {
  it('should fetch user profile', async () => {
    const mockProfile = { id: '1', full_name: 'Test User' };
    (profileAPI.getProfile as vi.Mock).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useProfile('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });
});

describe('useUpdateProfile', () => {
  it('should update user profile and invalidate queries', async () => {
    const mockProfile = { id: '1', full_name: 'Updated User' };
    (profileAPI.updateProfile as vi.Mock).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({ userId: '1', data: { full_name: 'Updated User' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(['profile', '1'])).toEqual(mockProfile);
  });
});
