// src/hooks/mutations/useCreateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';
import { Task } from '../../types/api.types';

const TASKS_QUERY_KEY = 'tasks';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      tasksAPI.create(taskData),
    onSuccess: () => {
      // Инвалидируем все задачи для обновления кэша
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
