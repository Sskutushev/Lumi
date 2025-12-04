// src/pages/__tests__/TodoDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TodoDashboard from '../TodoDashboard';
import { useAuthStore } from '../../store/authStore';
import { useTasks } from '../../hooks/queries/useTasks';
import { useProjects } from '../../hooks/queries/useProjects';
import { useProfile } from '../../hooks/queries/useProfile';
import { useCreateTask } from '../../hooks/mutations/useCreateTask';

// Мокаем зависимости
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
}));
vi.mock('../../store/authStore');
vi.mock('../../hooks/queries/useTasks');
vi.mock('../../hooks/queries/useProjects');
vi.mock('../../hooks/queries/useProfile');
vi.mock('../../hooks/mutations/useCreateTask');

const mockUser = { id: 'user1', email: 'test@example.com' };

// Расширенные мок-данные для тестов фильтрации и поиска
const mockTasks = [
  {
    id: '1',
    user_id: 'user1',
    title: 'High Priority Task',
    completed: false,
    priority: 'high',
    due_date: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Medium Priority Task',
    completed: false,
    priority: 'medium',
    due_date: '2025-01-02T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Low Priority Task',
    completed: true,
    priority: 'low',
    due_date: '2025-01-03T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'user1',
    title: 'Another High Task',
    completed: false,
    priority: 'high',
    due_date: '2025-01-04T00:00:00Z',
  },
];

const mockProjects = [{ id: 'project1', user_id: 'user1', name: 'Test Project' }];
const mockProfile = { id: 'user1', full_name: 'Test User' };
const mockMutate = vi.fn();

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('TodoDashboard Component', () => {
  vi.setTimeout(15000); // Увеличить таймаут для всех тестов в этом блоке
  beforeEach(() => {
    vi.resetAllMocks();
    (useAuthStore as vi.Mock).mockReturnValue({ user: mockUser });
    (useTasks as vi.Mock).mockReturnValue({ data: mockTasks, isLoading: false });
    (useProjects as vi.Mock).mockReturnValue({ data: mockProjects, isLoading: false });
    (useProfile as vi.Mock).mockReturnValue({ data: mockProfile, isLoading: false });
    (useCreateTask as vi.Mock).mockReturnValue({ mutate: mockMutate });
  });

  it('renders tasks correctly', () => {
    renderWithProviders(<TodoDashboard onSignOut={vi.fn()} />);
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
  });

  it('calls create task mutation with correct data', async () => {
    renderWithProviders(<TodoDashboard onSignOut={vi.fn()} />);
    const taskInput = screen.getByPlaceholderText('todo.addTaskPlaceholder');
    const addButton = taskInput.nextElementSibling as HTMLElement;

    fireEvent.change(taskInput, { target: { value: 'New Integration Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Integration Task', user_id: 'user1' }),
        expect.any(Object)
      );
    });
  });

  it('filters tasks by priority using AdvancedFilter', async () => {
    renderWithProviders(<TodoDashboard onSignOut={vi.fn()} />);

    // Убедимся, что все задачи на месте
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Another High Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();

    // Открываем продвинутый фильтр
    const filterButton = screen.getByLabelText('todo.advancedFilters');
    fireEvent.click(filterButton);

    // Кликаем на фильтр по высокому приоритету
    const highPriorityButton = await screen.findByRole('button', { name: /todo.priority.high/i });
    fireEvent.click(highPriorityButton);

    // Проверяем, что остались только задачи с высоким приоритетом
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Another High Task')).toBeInTheDocument();
    expect(screen.queryByText('Medium Priority Task')).not.toBeInTheDocument();
  });

  it('filters tasks by search query', async () => {
    renderWithProviders(<TodoDashboard onSignOut={vi.fn()} />);

    // Находим поле поиска и вводим текст
    const searchInput = screen.getByPlaceholderText('todo.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Medium' } });

    // Проверяем, что осталась только одна задача
    await waitFor(() => {
      expect(screen.queryByText('High Priority Task')).not.toBeInTheDocument();
      expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    });
  });
});
