// src/hooks/useRealtimeTasks.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '../lib/realtime/realtimeService';
import { Task } from '../types/api.types';

export const useRealtimeTasks = (userId: string) => {
  const queryClient = useQueryClient();
  const userIdRef = useRef(userId);

  // Обновляем ref при изменении userId
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Подписываемся на реалтайм обновления задач
    const unsubscribeFn = realtimeService.subscribeToTasks(userId, (task, eventType) => {
      // Инвалидируем кэш задач при получении обновления
      queryClient.invalidateQueries({ queryKey: ['tasks', userIdRef.current] });

      // В зависимости от типа события, можно выполнить дополнительные действия
      switch (eventType) {
        case 'INSERT':
          console.log(`New task created: ${task.title}`);
          break;
        case 'UPDATE':
          console.log(`Task updated: ${task.title}`);
          break;
        case 'DELETE':
          console.log(`Task deleted: ${task.title}`);
          break;
      }
    });

    // Отписываемся при размонтировании
    return () => {
      realtimeService.unsubscribe(`tasks-${userIdRef.current}`);
    };
  }, [userId, queryClient]);
};
