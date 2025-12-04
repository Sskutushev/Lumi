// API layer for projects
import { supabase } from '../supabase';
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStats } from '../../types/api.types';
import { projectInputSchema, validateUserInput, sanitizeInput } from '../security/securityUtils';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Logger } from '../errors/logger';
import { abortControllerService } from './abortController';

export const projectsAPI = {
  /**
   * Fetches all projects for a specific user.
   * @param userId - The ID of the user whose projects are to be fetched.
   * @returns A promise that resolves to an array of projects.
   */
  async getAll(userId: string): Promise<Project[]> {
    const controller = abortControllerService.create(`projects-getAll-${userId}`);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      if (error) throw error;
      return data as Project[];
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get projects:', error);
        throw ErrorHandler.handle(error);
      }
      return [];
    } finally {
      abortControllerService.cleanup(`projects-getAll-${userId}`);
    }
  },

  /**
   * Fetches a single project by its ID.
   * @param id - The ID of the project to fetch.
   * @returns A promise that resolves to the project object.
   */
  async getById(id: string): Promise<Project> {
    const controller = abortControllerService.create(`projects-getById-${id}`);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get project:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      abortControllerService.cleanup(`projects-getById-${id}`);
    }
  },

  /**
   * Creates a new project.
   * @param project - The project data for creation.
   * @returns A promise that resolves to the newly created project.
   */
  async create(project: CreateProjectDTO): Promise<Project> {
    const controller = abortControllerService.create('projects-create');
    try {
      validateUserInput(project, projectInputSchema);

      const sanitizedProject = {
        ...project,
        name: sanitizeInput(project.name),
        description: project.description ? sanitizeInput(project.description) : undefined,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([sanitizedProject])
        .select()
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to create project:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      abortControllerService.cleanup('projects-create');
    }
  },

  /**
   * Updates an existing project.
   * @param id - The ID of the project to update.
   * @param updates - An object containing the fields to update.
   * @returns A promise that resolves to the updated project.
   */
  async update(id: string, updates: UpdateProjectDTO): Promise<Project> {
    const controller = abortControllerService.create(`projects-update-${id}`);
    try {
      const updateSchema = projectInputSchema.partial();
      validateUserInput(updates, updateSchema);

      const sanitizedUpdates = {
        ...updates,
        name: updates.name ? sanitizeInput(updates.name) : undefined,
        description: updates.description ? sanitizeInput(updates.description) : undefined,
      };

      const { data, error } = await supabase
        .from('projects')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to update project:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      abortControllerService.cleanup(`projects-update-${id}`);
    }
  },

  /**
   * Deletes a project by its ID.
   * @param id - The ID of the project to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    const controller = abortControllerService.create(`projects-delete-${id}`);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .abortSignal(controller.signal);

      if (error) throw error;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to delete project:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      abortControllerService.cleanup(`projects-delete-${id}`);
    }
  },

  /**
   * Fetches statistics for a specific project.
   * @param projectId - The ID of the project.
   * @returns A promise that resolves to an object with project statistics.
   */
  async getStats(projectId: string): Promise<ProjectStats> {
    const controller = abortControllerService.create(`projects-getStats-${projectId}`);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('tasks_count, completed_tasks_count')
        .eq('id', projectId)
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;

      const today = new Date();
      const { data: overdueTasks, error: overdueError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('completed', false)
        .lt('due_date', today.toISOString().split('T')[0])
        .abortSignal(controller.signal);

      if (overdueError) throw overdueError;

      return {
        total: data.tasks_count,
        completed: data.completed_tasks_count,
        overdue: overdueTasks.length,
      };
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get project stats:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      abortControllerService.cleanup(`projects-getStats-${projectId}`);
    }
  },
};
