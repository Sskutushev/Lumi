import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tasksAPI } from '../tasks.api';
import { supabase } from '../../supabase';

// Мокаем supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

describe('tasksAPI', () => {
  const mockTask = {
    id: '1',
    user_id: 'user-123',
    title: 'Test Task',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create task', async () => {
    const mockInsertReturn = {
      data: { ...mockTask },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce(mockInsertReturn),
      }),
    });

    const result = await tasksAPI.create({
      user_id: 'user-123',
      title: 'Test Task',
      completed: false,
    });

    expect(result).toEqual(mockTask);
  });

  it('should throw error on create task failure', async () => {
    const mockInsertReturn = {
      data: null,
      error: { message: 'Insert failed' },
    };

    (supabase.from as any).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce(mockInsertReturn),
      }),
    });

    await expect(tasksAPI.create({
      user_id: 'user-123',
      title: 'Test Task',
      completed: false,
    })).rejects.toThrow('Insert failed');
  });

  it('should get all tasks', async () => {
    const mockSelectReturn = {
      data: [mockTask],
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce(mockSelectReturn),
    });

    const result = await tasksAPI.getAll('user-123');

    expect(result).toEqual([mockTask]);
  });

  it('should update task', async () => {
    const mockUpdateReturn = {
      data: { ...mockTask, completed: true },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce(mockUpdateReturn),
        }),
      }),
    });

    const result = await tasksAPI.update('1', { completed: true });

    expect(result).toEqual({ ...mockTask, completed: true });
  });

  it('should delete task', async () => {
    const mockDeleteReturn = {
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      delete: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce(mockDeleteReturn),
      }),
    });

    await expect(tasksAPI.delete('1')).resolves.not.toThrow();
  });

  it('should toggle task completion', async () => {
    const mockUpdateReturn = {
      data: { ...mockTask, completed: true },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce(mockUpdateReturn),
        }),
      }),
    });

    const result = await tasksAPI.toggleComplete('1');

    expect(result).toEqual({ ...mockTask, completed: true });
  });
});