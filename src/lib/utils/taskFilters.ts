// src/lib/utils/taskFilters.ts
import { Task, Project } from '../../types/api.types';
import { FilterOptions } from '../../components/common/AdvancedFilter';

export const filterAndSortTasks = (
  tasks: Task[],
  projects: Project[],
  filters: FilterOptions
): Task[] => {
  let filteredTasks = [...tasks];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  }

  // Apply priority filter
  if (filters.priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority);
  }

  // Apply project filter
  if (filters.project_id) {
    filteredTasks = filteredTasks.filter((task) => task.project_id === filters.project_id);
  }

  // Apply status filter
  filteredTasks = filteredTasks.filter((task) => {
    switch (filters.status) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'overdue':
        return !task.completed && task.due_date && new Date(task.due_date) < new Date();
      default:
        return true;
    }
  });

  // Apply date range filter
  if (filters.dateRange) {
    filteredTasks = filteredTasks.filter((task) => {
      if (!task.due_date) return false;

      const taskDate = new Date(task.due_date);
      const startDate = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;

      if (startDate && taskDate < startDate) return false;
      if (endDate && taskDate > endDate) return false;

      return true;
    });
  }

  // Apply assignee filter
  if (filters.assignee) {
    // In current implementation all tasks belong to the user, but can be extended
    filteredTasks = filteredTasks.filter((task) => task.user_id === filters.assignee);
  }

  // Sort tasks
  filteredTasks.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'priority':
        // Match priorities with numeric values for sorting (high = 3, medium = 2, low = 1)
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority || 'low'] || 0;
        const priorityB = priorityOrder[b.priority || 'low'] || 0;
        comparison = priorityA - priorityB; // Ascending: low first
        break;
      case 'date':
        if (a.due_date && b.due_date) {
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        } else if (a.due_date) {
          comparison = -1;
        } else if (b.due_date) {
          comparison = 1;
        } else {
          comparison = 0;
        }
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'project':
        // Sort by project name
        const projectA = projects.find((p) => p.id === a.project_id);
        const projectB = projects.find((p) => p.id === b.project_id);
        comparison = (projectA?.name || '').localeCompare(projectB?.name || '');
        break;
    }

    // Apply sort order
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredTasks;
};
