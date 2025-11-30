// API слой для задач
import { supabase } from '../supabase';
import { 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO,
  ProjectStats,
  UserStats
} from '../types/api.types';

export const tasksAPI = {
  // Получить все задачи пользователя, опционально фильтруя по проекту
  async getAll(userId: string, projectId?: string): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      throw new Error('Failed to get tasks');
    }
  },

  // Получить задачу по ID
  async getById(id: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      console.error('Failed to get task:', error);
      throw new Error('Failed to get task');
    }
  },

  // Создать задачу
  async create(task: CreateTaskDTO): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('Failed to create task');
    }
  },

  // Обновить задачу
  async update(id: string, updates: UpdateTaskDTO): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw new Error('Failed to update task');
    }
  },

  // Удалить задачу
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw new Error('Failed to delete task');
    }
  },

  // Переключить статус выполнения задачи
  async toggleComplete(id: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: supabase.rpc('not', { bool: 'completed' }) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      throw new Error('Failed to toggle task completion');
    }
  },

  // Получить статистику задач для пользователя
  async getStats(userId: string): Promise<UserStats> {
    try {
      // Получаем все задачи пользователя
      const allTasks = await this.getAll(userId);
      
      // Подсчитываем общее количество задач
      const total = allTasks.length;
      
      // Подсчитываем завершенные задачи
      const completed = allTasks.filter(task => task.completed).length;
      
      // Подсчитываем просроченные задачи (незавершенные с датой в прошлом)
      const today = new Date();
      const overdue = allTasks.filter(task => {
        return !task.completed && 
               task.due_date && 
               new Date(task.due_date) < today;
      }).length;
      
      // Подсчитываем задачи на этой неделе
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const tasksThisWeek = allTasks.filter(task => {
        return new Date(task.created_at) >= oneWeekAgo;
      }).length;

      return {
        total_tasks: total,
        completed_tasks: completed,
        overdue_tasks: overdue,
        tasks_this_week: tasksThisWeek
      };
    } catch (error) {
      console.error('Failed to get task stats:', error);
      throw new Error('Failed to get task stats');
    }
  }
};