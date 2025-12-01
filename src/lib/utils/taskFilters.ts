// src/lib/utils/taskFilters.ts
import { Task, Project } from '../../src/types/api.types';
import { FilterOptions } from '../../src/components/common/AdvancedFilter';

export const filterAndSortTasks = (
  tasks: Task[],
  projects: Project[],
  filters: FilterOptions
): Task[] => {
  let filteredTasks = [...tasks];

  // Применяем фильтр поиска
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  }

  // Применяем фильтр приоритета
  if (filters.priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority);
  }

  // Применяем фильтр проекта
  if (filters.project_id) {
    filteredTasks = filteredTasks.filter((task) => task.project_id === filters.project_id);
  }

  // Применяем фильтр статуса
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

  // Применяем фильтр по диапазону дат
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

  // Применяем фильтр по исполнителю
  if (filters.assignee) {
    // В текущей реализации все задачи принадлежат пользователю, но можно расширить
    filteredTasks = filteredTasks.filter((task) => task.user_id === filters.assignee);
  }

  // Сортируем задачи
  filteredTasks.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'priority':
        // Сопоставляем приоритеты с числовыми значениями для сортировки
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        comparison =
          (priorityOrder[b.priority || 'low'] || 0) - (priorityOrder[a.priority || 'low'] || 0);
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
        // Сортировка по имени проекта
        const projectA = projects.find((p) => p.id === a.project_id);
        const projectB = projects.find((p) => p.id === b.project_id);
        comparison = (projectA?.name || '').localeCompare(projectB?.name || '');
        break;
    }

    // Применяем порядок сортировки
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredTasks;
};
