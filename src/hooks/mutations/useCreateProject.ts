// src/hooks/mutations/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../lib/api/projects.api';
import { Project } from '../../types/api.types';

const PROJECTS_QUERY_KEY = 'projects';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) =>
      projectsAPI.create(projectData),
    onSuccess: () => {
      // Инвалидируем все проекты для обновления кэша
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};
