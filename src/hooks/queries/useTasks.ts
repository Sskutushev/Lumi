// src/hooks/queries/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';
import { Task } from '../../types/api.types';

const TASKS_QUERY_KEY = 'tasks';

export const useTasks = (userId: string) => {
  return useQuery<Task[]>({
    queryKey: [TASKS_QUERY_KEY, userId],
    queryFn: () => tasksAPI.getAll(userId),
    enabled: !!userId,
  });
};

export const useTask = (taskId: string) => {
  return useQuery<Task>({
    queryKey: [TASKS_QUERY_KEY, taskId],
    queryFn: () => tasksAPI.getById(taskId),
    enabled: !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksAPI.create,
    onSuccess: () => {
      // Инвалидируем все задачи для обновления кэша
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};

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

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: (_, taskId) => {
      // Удаляем задачу из кэша
      queryClient.removeQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
      // Инвалидируем все задачи для обновления списка
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
