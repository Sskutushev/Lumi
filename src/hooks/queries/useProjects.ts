// src/hooks/queries/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../lib/api/projects.api';
import { Project } from '../../types/api.types';

const PROJECTS_QUERY_KEY = 'projects';

export const useProjects = (userId: string) => {
  return useQuery<Project[]>({
    queryKey: [PROJECTS_QUERY_KEY, userId],
    queryFn: () => projectsAPI.getAll(userId),
    enabled: !!userId,
  });
};

export const useProject = (projectId: string) => {
  return useQuery<Project>({
    queryKey: [PROJECTS_QUERY_KEY, projectId],
    queryFn: () => projectsAPI.getById(projectId),
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      // Инвалидируем все проекты для обновления кэша
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsAPI.update(id, data),
    onSuccess: (updatedProject) => {
      // Обновляем конкретный проект в кэше
      queryClient.setQueryData([PROJECTS_QUERY_KEY, updatedProject.id], updatedProject);
      // Инвалидируем все проекты для обновления списка
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: (_, projectId) => {
      // Удаляем проект из кэша
      queryClient.removeQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] });
      // Инвалидируем все проекты для обновления списка
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};
