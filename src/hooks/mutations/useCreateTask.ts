// src/hooks/mutations/useCreateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';
import { Task } from '../../types/api.types';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Custom hook to create a new task.
 * @returns A TanStack Mutation object for creating a task.
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      tasksAPI.create(taskData),
    onSuccess: () => {
      // Invalidate all tasks to refetch the cache
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
