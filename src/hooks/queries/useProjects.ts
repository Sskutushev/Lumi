// src/hooks/queries/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../lib/api/projects.api';
import { Project } from '../../types/api.types';

const PROJECTS_QUERY_KEY = 'projects';

/**
 * Custom hook to fetch all projects for a user.
 * @param userId - The ID of the user.
 * @returns A TanStack Query object for the user's projects.
 */
export const useProjects = (userId: string) => {
  return useQuery<Project[]>({
    queryKey: [PROJECTS_QUERY_KEY, userId],
    queryFn: () => projectsAPI.getAll(userId),
    enabled: !!userId,
  });
};

/**
 * Custom hook to fetch a single project by its ID.
 * @param projectId - The ID of the project to fetch.
 * @returns A TanStack Query object for the project.
 */
export const useProject = (projectId: string) => {
  return useQuery<Project>({
    queryKey: [PROJECTS_QUERY_KEY, projectId],
    queryFn: () => projectsAPI.getById(projectId),
    enabled: !!projectId,
  });
};

/**
 * Custom hook to create a new project.
 * @returns A TanStack Mutation object for creating a project.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      // Invalidate all projects to refetch the cache
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};

/**
 * Custom hook to update an existing project.
 * @returns A TanStack Mutation object for updating a project.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsAPI.update(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in the cache
      queryClient.setQueryData([PROJECTS_QUERY_KEY, updatedProject.id], updatedProject);
      // Invalidate all projects to refetch the list
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};

/**
 * Custom hook to delete a project.
 * @returns A TanStack Mutation object for deleting a project.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: (_, projectId) => {
      // Remove the project from the cache
      queryClient.removeQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] });
      // Invalidate all projects to refetch the list
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
};
