// API слой для проектов
import { supabase } from '../supabase';
import { 
  Project, 
  CreateProjectDTO, 
  UpdateProjectDTO,
  ProjectStats
} from '../../types/api.types';

export const projectsAPI = {
  // Получить все проекты пользователя
  async getAll(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw new Error('Failed to get projects');
    }
  },

  // Получить проект по ID
  async getById(id: string): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Failed to get project:', error);
      throw new Error('Failed to get project');
    }
  },

  // Создать проект
  async create(project: CreateProjectDTO): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error('Failed to create project');
    }
  },

  // Обновить проект
  async update(id: string, updates: UpdateProjectDTO): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw new Error('Failed to update project');
    }
  },

  // Удалить проект
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project');
    }
  },

  // Получить статистику проекта
  async getStats(projectId: string): Promise<ProjectStats> {
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
        overdue: overdueTasks.length
      };
    } catch (error) {
      console.error('Failed to get project stats:', error);
      throw new Error('Failed to get project stats');
    }
  }
};