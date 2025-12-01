// API слой для задач
import { supabase } from '../supabase';
import { Task, CreateTaskDTO, UpdateTaskDTO, UserStats } from '../../types/api.types';
import { taskInputSchema, validateUserInput, sanitizeInput } from '../security/securityUtils';
import { ErrorHandler } from '../errors/ErrorHandler'; // Added import
import { Logger } from '../errors/logger'; // Added import

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
      Logger.error('Failed to get tasks:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Получить задачу по ID
  async getById(id: string): Promise<Task> {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      Logger.error('Failed to get task:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Создать задачу
  async create(task: CreateTaskDTO): Promise<Task> {
    try {
      // Валидируем входные данные
      validateUserInput(task, taskInputSchema);

      // Санитизируем заголовок и описание
      const sanitizedTask = {
        ...task,
        title: sanitizeInput(task.title),
        description: task.description ? sanitizeInput(task.description) : undefined,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([sanitizedTask])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      Logger.error('Failed to create task:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Обновить задачу
  async update(id: string, updates: UpdateTaskDTO): Promise<Task> {
    try {
      // Валидируем входные данные (создаем схему обновления)
      const updateSchema = taskInputSchema.partial(); // Используем частичную схему для обновления
      validateUserInput(updates, updateSchema);

      // Санитизируем заголовок и описание, если они присутствуют
      const sanitizedUpdates = {
        ...updates,
        title: updates.title ? sanitizeInput(updates.title) : undefined,
        description: updates.description ? sanitizeInput(updates.description) : undefined,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      Logger.error('Failed to update task:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },

  // Удалить задачу
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      Logger.error('Failed to delete task:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
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
      Logger.error('Failed to toggle task completion:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
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
      const completed = allTasks.filter((task) => task.completed).length;

      // Подсчитываем просроченные задачи (незавершенные с датой в прошлом)
      const today = new Date();
      const overdue = allTasks.filter((task) => {
        return !task.completed && task.due_date && new Date(task.due_date) < today;
      }).length;

      // Подсчитываем задачи на этой неделе
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const tasksThisWeek = allTasks.filter((task) => {
        return new Date(task.created_at) >= oneWeekAgo;
      }).length;

      return {
        total_tasks: total,
        completed_tasks: completed,
        overdue_tasks: overdue,
        tasks_this_week: tasksThisWeek,
      };
    } catch (error) {
      Logger.error('Failed to get task stats:', error); // Modified
      throw ErrorHandler.handle(error); // Modified
    }
  },
};
