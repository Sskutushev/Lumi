import { describe, it, expect } from 'vitest';
import { filterAndSortTasks } from '../taskFilters';
import { Task, Project } from '../../../types/api.types';

describe('taskFilters', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      user_id: 'user1',
      title: 'High Priority Task',
      completed: false,
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    },
    {
      id: '2',
      user_id: 'user1',
      title: 'Completed Task',
      completed: true,
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    },
    {
      id: '3',
      user_id: 'user1',
      title: 'Low Priority Task',
      completed: false,
      priority: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'proj1',
      user_id: 'user1',
      name: 'Project 1',
      description: 'Test project',
      tasks_count: 2,
      completed_tasks_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it('should filter tasks by priority', () => {
    const filters = {
      priority: 'high' as const,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe('high');
    expect(result[0].title).toBe('High Priority Task');
  });

  it('should filter tasks by status (completed)', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'completed' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
    expect(result[0].title).toBe('Completed Task');
  });

  it('should filter tasks by status (pending)', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'pending' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    expect(result).toHaveLength(2);
    expect(result.every((task) => !task.completed)).toBe(true);
  });

  it('should filter tasks by search query', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: 'High',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('High');
  });

  it('should sort tasks by priority', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'priority' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    // High priority should come first
    expect(result[0].priority).toBe('high');
    expect(result[1].priority).toBe('medium');
    expect(result[2].priority).toBe('low');
  });

  it('should sort tasks by date in descending order', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    // Tasks should be sorted by date (descending)
    for (let i = 0; i < result.length - 1; i++) {
      if (result[i].due_date && result[i + 1].due_date) {
        expect(new Date(result[i].due_date).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i + 1].due_date).getTime()
        );
      }
    }
  });

  it('should sort tasks by name in ascending order', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
    };

    const result = filterAndSortTasks(mockTasks, mockProjects, filters);

    expect(result[0].title).toBe('Completed Task');
    expect(result[1].title).toBe('High Priority Task');
    expect(result[2].title).toBe('Low Priority Task');
  });

  it('should handle empty tasks array', () => {
    const filters = {
      priority: null,
      project_id: null,
      status: 'all' as const,
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    };

    const result = filterAndSortTasks([], mockProjects, filters);

    expect(result).toHaveLength(0);
  });
});
