// src/pages/__tests__/ProjectView.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProjectView from '../ProjectView';
import { useAuthStore } from '../../store/authStore';
import { useTasks } from '../../hooks/queries/useTasks';
import { useCreateTask } from '../../hooks/mutations/useCreateTask';
import { useUpdateTask } from '../../hooks/mutations/useUpdateTask';
import { projectsAPI } from '../../lib/api/projects.api';

// --- Моки ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../store/authStore');
vi.mock('../../hooks/queries/useTasks');
vi.mock('../../hooks/mutations/useCreateTask');
vi.mock('../../hooks/mutations/useUpdateTask');
vi.mock('../../lib/api/projects.api');

const mockUser = { id: 'user1' };
const mockProject = { id: 'project1', name: 'Test Project', description: 'A project for testing.' };
const mockTasks = [
  { id: 'task1', title: 'First Task', completed: false, project_id: 'project1' },
  { id: 'task2', title: 'Second Task', completed: true, project_id: 'project1' },
];
const mockStats = { total: 2, completed: 1, overdue: 0 };
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

const queryClient = new QueryClient();
const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectView project={mockProject as any} onBack={vi.fn()} />
    </QueryClientProvider>
  );
};

describe('ProjectView Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAuthStore as vi.Mock).mockReturnValue({ user: mockUser });
    (useTasks as vi.Mock).mockReturnValue({ data: mockTasks, isLoading: false });
    vi.mocked(projectsAPI.getStats).mockResolvedValue(mockStats);
    (useCreateTask as vi.Mock).mockReturnValue({ mutate: mockCreateMutate });
    (useUpdateTask as vi.Mock).mockReturnValue({ mutate: mockUpdateMutate });
  });

  it('should render project details, stats, and tasks', async () => {
    renderComponent();

    // Проверяем детали проекта
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A project for testing.')).toBeInTheDocument();

    // Проверяем статистику
    await waitFor(() => {
      expect(screen.getByText('dashboard.totalTasks').nextElementSibling?.textContent).toBe(
        String(mockStats.total)
      );
      expect(screen.getByText('dashboard.completed').nextElementSibling?.textContent).toBe(
        String(mockStats.completed)
      );
      expect(screen.getByText('dashboard.overdue').nextElementSibling?.textContent).toBe(
        String(mockStats.overdue)
      );
    });

    // Проверяем список задач
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('should call useCreateTask mutation when adding a new task', async () => {
    renderComponent();

    const addTaskButton = screen.getByRole('button', { name: 'common.add' });
    fireEvent.click(addTaskButton);

    const input = await screen.findByPlaceholderText('todo.addTaskPlaceholder');
    const saveButton = (await screen.findAllByRole('button', { name: 'common.add' }))[1];

    fireEvent.change(input, { target: { value: 'A brand new task' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        {
          user_id: mockUser.id,
          project_id: mockProject.id,
          title: 'A brand new task',
          completed: false,
          priority: 'medium',
        },
        expect.any(Object)
      );
    });
  });

  it('should call useUpdateTask mutation when toggling a task', async () => {
    renderComponent();

    // Находим первую задачу и ее чекбокс
    const firstTaskElement = screen.getByText('First Task');
    const taskContainer = firstTaskElement.closest('div');
    const checkbox = taskContainer?.querySelector('[role="checkbox"]') as HTMLElement;

    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: 'task1',
        data: { completed: true },
      });
    });
  });
});
