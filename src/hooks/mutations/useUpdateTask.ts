// src/hooks/mutations/useUpdateTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../lib/api/tasks.api';
import { Task } from '../../types/api.types';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Custom hook to update an existing task.
 * @returns A TanStack Mutation object for updating a task.
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => tasksAPI.update(id, data),
    onSuccess: (updatedTask) => {
      // Update the specific task in the cache
      queryClient.setQueryData([TASKS_QUERY_KEY, updatedTask.id], updatedTask);
      // Invalidate all tasks to refetch the list
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
