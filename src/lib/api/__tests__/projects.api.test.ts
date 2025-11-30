import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectsAPI } from '../projects.api';
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

describe('projectsAPI', () => {
  const mockProject = {
    id: '1',
    user_id: 'user-123',
    name: 'Test Project',
    description: 'Test Description',
    tasks_count: 0,
    completed_tasks_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create project', async () => {
    const mockInsertReturn = {
      data: { ...mockProject },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce(mockInsertReturn),
      }),
    });

    const result = await projectsAPI.create({
      user_id: 'user-123',
      name: 'Test Project',
      description: 'Test Description',
    });

    expect(result).toEqual(mockProject);
  });

  it('should get all projects', async () => {
    const mockSelectReturn = {
      data: [mockProject],
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce(mockSelectReturn),
    });

    const result = await projectsAPI.getAll('user-123');

    expect(result).toEqual([mockProject]);
  });

  it('should update project', async () => {
    const mockUpdateReturn = {
      data: { ...mockProject, name: 'Updated Project' },
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce(mockUpdateReturn),
        }),
      }),
    });

    const result = await projectsAPI.update('1', { name: 'Updated Project' });

    expect(result).toEqual({ ...mockProject, name: 'Updated Project' });
  });

  it('should delete project', async () => {
    const mockDeleteReturn = {
      error: null,
    };

    (supabase.from as any).mockReturnValueOnce({
      delete: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce(mockDeleteReturn),
      }),
    });

    await expect(projectsAPI.delete('1')).resolves.not.toThrow();
  });

  it('should get project stats', async () => {
    const mockSelectReturn = {
      data: { tasks_count: 5, completed_tasks_count: 2 },
      error: null,
    };

    (supabase.from as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce(mockSelectReturn),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            lt: vi.fn().mockReturnValueOnce({ data: [], error: null }),
          }),
        }),
      });

    const result = await projectsAPI.getStats('1');

    expect(result).toEqual({
      total: 5,
      completed: 2,
      overdue: 0,
    });
  });
});