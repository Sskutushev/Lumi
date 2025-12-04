import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { tasksAPI } from '../tasks.api';
import { supabase } from '../../supabase'; // Импортируем из нашего клиента

// Mock данных
const mockTask = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  completed: false,
  priority: 'medium',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockUserStats = {
  total_tasks: 10,
  completed_tasks: 5,
  overdue_tasks: 2,
  tasks_this_week: 3,
};

// Mock supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock ErrorHandler и Logger
vi.mock('../../errors/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn((error) => error),
  },
}));

vi.mock('../../errors/logger', () => ({
  Logger: {
    error: vi.fn(),
  },
}));

describe('tasksAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all tasks for user', async () => {
      // Мокаем ответ от Supabase
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockTask],
          error: null,
        }),
      });

      const result = await tasksAPI.getAll('user-1');

      expect(result).toEqual([mockTask]);
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should filter tasks by project if projectId provided', async () => {
      // Мокаем ответ от Supabase
      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [mockTask],
            error: null,
          }),
        });

      const result = await tasksAPI.getAll('user-1', 'project-1');

      expect(result).toEqual([mockTask]);
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Failed to fetch');
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error,
        }),
      });

      await expect(tasksAPI.getAll('user-1')).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getById', () => {
    it('should fetch a task by ID', async () => {
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockTask,
          error: null,
        }),
        single: vi.fn().mockResolvedValue({
          data: mockTask,
          error: null,
        }),
      });

      const result = await tasksAPI.getById('task-1');

      expect(result).toEqual(mockTask);
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Task not found');
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error,
        }),
      });

      await expect(tasksAPI.getById('task-1')).rejects.toThrow('Task not found');
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const newTask = {
        user_id: 'user-1',
        title: 'New Task',
        completed: false,
        priority: 'medium',
      };

      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockTask, ...newTask },
          error: null,
        }),
      });

      const result = await tasksAPI.create(newTask);

      expect(result).toEqual({ ...mockTask, ...newTask });
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should throw error when creation fails', async () => {
      const newTask = {
        user_id: 'user-1',
        title: 'New Task',
        completed: false,
        priority: 'medium',
      };

      const error = new Error('Insert failed');
      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error,
        }),
      });

      await expect(tasksAPI.create(newTask)).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updates = {
        title: 'Updated Task',
        completed: true,
      };

      (supabase.from as any).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockTask, ...updates },
          error: null,
        }),
      });

      const result = await tasksAPI.update('task-1', updates);

      expect(result).toEqual({ ...mockTask, ...updates });
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should throw error when update fails', async () => {
      const updates = {
        title: 'Updated Task',
      };

      const error = new Error('Update failed');
      (supabase.from as any).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error,
        }),
      });

      await expect(tasksAPI.update('task-1', updates)).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      (supabase.from as any).mockReturnValueOnce({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      await tasksAPI.delete('task-1'); // No error means success

      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Delete failed');
      (supabase.from as any).mockReturnValueOnce({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error,
        }),
      });

      await expect(tasksAPI.delete('task-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      // Мокаем вызов getAll, чтобы вернуть список задач
      vi.spyOn(tasksAPI, 'getAll').mockResolvedValue([
        mockTask, // Completed task
        { ...mockTask, id: 'task-2', completed: true }, // Completed
        {
          ...mockTask,
          id: 'task-3',
          completed: false,
          due_date: new Date(Date.now() - 86400000).toISOString(),
        }, // Overdue
      ]);

      const result = await tasksAPI.getStats('user-1');

      expect(result).toEqual({
        total_tasks: 3,
        completed_tasks: 2,
        overdue_tasks: 1,
        tasks_this_week: 0, // No tasks created this week
      });
    });

    it('should calculate stats correctly', async () => {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      const tasksForStats = [
        { ...mockTask, id: '1', completed: true }, // Completed
        { ...mockTask, id: '2', completed: false }, // Not completed
        {
          ...mockTask,
          id: '3',
          completed: false,
          due_date: new Date(Date.now() - 86400000).toISOString(),
        }, // Overdue
        { ...mockTask, id: '4', completed: false, created_at: oneWeekAgo.toISOString() }, // Created this week
      ];

      vi.spyOn(tasksAPI, 'getAll').mockResolvedValue(tasksForStats);

      const result = await tasksAPI.getStats('user-1');

      expect(result.total_tasks).toBe(4);
      expect(result.completed_tasks).toBe(1); // Only 1 task is completed
      expect(result.overdue_tasks).toBe(1); // 1 task is overdue
      expect(result.tasks_this_week).toBe(1); // 1 task created this week
    });
  });
});
