// src/hooks/useRealtimeTasks.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '../lib/realtime/realtimeService';

const TASKS_QUERY_KEY = 'tasks';

export const useRealtimeTasks = (userId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = realtimeService.subscribeToTasks(userId, () => {
      // Invalidate the tasks cache on receiving an update
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, userId] });
    });

    return () => {
      realtimeService.unsubscribe(channel);
    };
  }, [userId, queryClient]);
};
