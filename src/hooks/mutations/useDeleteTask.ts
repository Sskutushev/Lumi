// src/hooks/mutations/useDeleteTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';

const TASKS_QUERY_KEY = 'tasks';

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: (_, taskId) => {
      // Удаляем задачу из кэша
      queryClient.removeQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
      // Инвалидируем все задачи для обновления списка
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
