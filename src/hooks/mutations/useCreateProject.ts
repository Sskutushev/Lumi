// src/hooks/mutations/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../lib/api/projects.api';
import { Project } from '../../types/api.types';

const PROJECTS_QUERY_KEY = 'projects';

/**
 * Custom hook to create a new project.
 * @returns A TanStack Mutation object for creating a project.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      projectData: Omit<
        Project,
        'id' | 'created_at' | 'updated_at' | 'tasks_count' | 'completed_tasks_count'
      >
    ) => projectsAPI.create(projectData),
    onSuccess: () => {
      // Invalidate all projects to refetch the cache
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};
