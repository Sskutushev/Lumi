// src/hooks/mutations/useDeleteTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Custom hook to delete a task.
 * @returns A TanStack Mutation object for deleting a task.
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId),
    onSuccess: (_, taskId) => {
      // Remove the task from the cache
      queryClient.removeQueries({ queryKey: [TASKS_QUERY_KEY, taskId] });
      // Invalidate all tasks to refetch the list
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
