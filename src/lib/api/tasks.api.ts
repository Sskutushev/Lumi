// API layer for tasks
import { supabase } from '../supabase';
import { Task, CreateTaskDTO, UpdateTaskDTO, UserStats } from '../../types/api.types';
import { taskInputSchema, validateUserInput, sanitizeInput } from '../security/securityUtils';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Logger } from '../errors/logger';
import { abortControllerService } from './abortController';

export const tasksAPI = {
  /**
   * Fetches all tasks for a specific user, optionally filtered by project.
   * @param userId - The ID of the user whose tasks are to be fetched.
   * @param projectId - Optional ID of the project to filter tasks by.
   * @returns A promise that resolves to an array of tasks.
   */
  async getAll(userId: string, projectId?: string): Promise<Task[]> {
    const controller = abortControllerService.create(
      `tasks-getAll-${userId}-${projectId || 'all'}`
    );
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.abortSignal(controller.signal);

      if (error) throw error;
      return data as Task[];
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get tasks:', error);
        throw ErrorHandler.handle(error);
      }
      return []; // Return empty array on abort
    } finally {
      controller.abort();
      abortControllerService.cleanup(`tasks-getAll-${userId}-${projectId || 'all'}`);
    }
  },

  /**
   * Fetches a single task by its ID.
   * @param id - The ID of the task to fetch.
   * @returns A promise that resolves to the task object.
   */
  async getById(id: string): Promise<Task> {
    const controller = abortControllerService.create(`tasks-getById-${id}`);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get task:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      controller.abort();
      abortControllerService.cleanup(`tasks-getById-${id}`);
    }
  },

  /**
   * Creates a new task.
   * @param task - The task data for creation.
   * @returns A promise that resolves to the newly created task.
   */
  async create(task: CreateTaskDTO): Promise<Task> {
    const controller = abortControllerService.create(`tasks-create`);
    try {
      validateUserInput(task, taskInputSchema);

      const sanitizedTask = {
        ...task,
        title: sanitizeInput(task.title),
        description: task.description ? sanitizeInput(task.description) : undefined,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([sanitizedTask])
        .select()
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to create task:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      controller.abort();
      abortControllerService.cleanup(`tasks-create`);
    }
  },

  /**
   * Updates an existing task.
   * @param id - The ID of the task to update.
   * @param updates - An object containing the fields to update.
   * @returns A promise that resolves to the updated task.
   */
  async update(id: string, updates: UpdateTaskDTO): Promise<Task> {
    const controller = abortControllerService.create(`tasks-update-${id}`);
    try {
      const updateSchema = taskInputSchema.partial();
      validateUserInput(updates, updateSchema);

      // Filter out null values that should be optional, only keep defined values
      const filteredUpdates: Partial<UpdateTaskDTO> = {};
      if (updates.title !== undefined && updates.title !== null) {
        filteredUpdates.title = sanitizeInput(updates.title);
      }
      if (updates.description !== undefined && updates.description !== null) {
        filteredUpdates.description = sanitizeInput(updates.description);
      }
      if (updates.priority !== undefined && updates.priority !== null) {
        filteredUpdates.priority = updates.priority;
      }
      if (updates.due_date !== undefined && updates.due_date !== null) {
        filteredUpdates.due_date = updates.due_date;
      }
      if (updates.project_id !== undefined) {
        // project_id can be null
        filteredUpdates.project_id = updates.project_id;
      }
      if (updates.completed !== undefined && updates.completed !== null) {
        filteredUpdates.completed = updates.completed;
      }

      const sanitizedUpdates = filteredUpdates;

      const { data, error } = await supabase
        .from('tasks')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      return data as Task;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to update task:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      controller.abort();
      abortControllerService.cleanup(`tasks-update-${id}`);
    }
  },

  /**
   * Deletes a task by its ID.
   * @param id - The ID of the task to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    const controller = abortControllerService.create(`tasks-delete-${id}`);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .abortSignal(controller.signal);

      if (error) throw error;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to delete task:', error);
        throw ErrorHandler.handle(error);
      }
    } finally {
      controller.abort();
      abortControllerService.cleanup(`tasks-delete-${id}`);
    }
  },

  /**
   * Fetches task statistics for a specific user.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an object with user statistics.
   */
  async getStats(userId: string): Promise<UserStats> {
    try {
      const allTasks = await this.getAll(userId);

      const total = allTasks.length;
      const completed = allTasks.filter((task) => task.completed).length;

      const today = new Date();
      const overdue = allTasks.filter(
        (task) => !task.completed && task.due_date && new Date(task.due_date) < today
      ).length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const tasksThisWeek = allTasks.filter(
        (task) => new Date(task.created_at) >= oneWeekAgo
      ).length;

      return {
        total_tasks: total,
        completed_tasks: completed,
        overdue_tasks: overdue,
        tasks_this_week: tasksThisWeek,
      };
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        Logger.error('Failed to get task stats:', error);
        throw ErrorHandler.handle(error);
      }
      throw error;
    } finally {
      abortControllerService.cleanup(`tasks-getStats-${userId}`);
    }
  },
};
