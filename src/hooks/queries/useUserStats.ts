// src/hooks/queries/useUserStats.ts
import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../../lib/api/profile.api';
import { StorageStats } from '../../types/api.types';

const STATS_QUERY_KEY = 'userStats';

export const useUserStats = (userId: string) => {
  return useQuery<StorageStats>({
    queryKey: [STATS_QUERY_KEY, userId],
    queryFn: () => profileAPI.getStorageStats(userId),
    enabled: !!userId,
  });
};
