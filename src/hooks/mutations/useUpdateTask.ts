// src/hooks/mutations/useUpdateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';
import { Task } from '../../types/api.types';

const TASKS_QUERY_KEY = 'tasks';

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => tasksAPI.update(id, data),
    onSuccess: (updatedTask) => {
      // Обновляем конкретную задачу в кэше
      queryClient.setQueryData([TASKS_QUERY_KEY, updatedTask.id], updatedTask);
      // Инвалидируем все задачи для обновления списка
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
