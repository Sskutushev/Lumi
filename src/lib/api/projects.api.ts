// API слой для проектов
import { supabase } from '../supabase';
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStats } from '../../types/api.types';
import { projectInputSchema, validateUserInput, sanitizeInput } from '../security/securityUtils';
import { ErrorHandler } from '../errors/ErrorHandler'; // Added import
import { Logger } from '../errors/logger'; // Added import
import { abortControllerService } from './abortController';

export const projectsAPI = {
  // Получить все проекты пользователя
  async getAll(userId: string): Promise<Project[]> {
    const key = `projects-getAll-${userId}`;
    abortControllerService.create(key);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    } catch (error) {
      Logger.error('Failed to get projects:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },

  // Получить проект по ID
  async getById(id: string): Promise<Project> {
    const key = `projects-getById-${id}`;
    abortControllerService.create(key);

    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      Logger.error('Failed to get project:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },

  // Создать проект
  async create(project: CreateProjectDTO): Promise<Project> {
    const key = `projects-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    abortControllerService.create(key);

    try {
      // Валидируем входные данные
      validateUserInput(project, projectInputSchema);

      // Санитизируем название и описание
      const sanitizedProject = {
        ...project,
        name: sanitizeInput(project.name),
        description: project.description ? sanitizeInput(project.description) : undefined,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([sanitizedProject])
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      Logger.error('Failed to create project:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },

  // Обновить проект
  async update(id: string, updates: UpdateProjectDTO): Promise<Project> {
    const key = `projects-update-${id}`;
    abortControllerService.create(key);

    try {
      // Валидируем входные данные (создаем схему обновления)
      const updateSchema = projectInputSchema.partial(); // Используем частичную схему для обновления
      validateUserInput(updates, updateSchema);

      // Санитизируем название и описание, если они присутствуют
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
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      Logger.error('Failed to update project:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },

  // Удалить проект
  async delete(id: string): Promise<void> {
    const key = `projects-delete-${id}`;
    abortControllerService.create(key);

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      Logger.error('Failed to delete project:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },

  // Получить статистику проекта
  async getStats(projectId: string): Promise<ProjectStats> {
    const key = `projects-getStats-${projectId}`;
    abortControllerService.create(key);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('tasks_count, completed_tasks_count')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      // Подсчитываем просроченные задачи в проекте
      const today = new Date();
      const { data: overdueTasks, error: overdueError } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId)
        .eq('completed', false)
        .lt('due_date', today.toISOString().split('T')[0]); // Сравниваем только дату

      if (overdueError) throw overdueError;

      return {
        total: data.tasks_count,
        completed: data.completed_tasks_count,
        overdue: overdueTasks.length,
      };
    } catch (error) {
      Logger.error('Failed to get project stats:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    } finally {
      abortControllerService.cleanup(key);
    }
  },
};
