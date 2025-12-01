// src/pages/__tests__/TodoDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoDashboard from '../TodoDashboard';
import { useAuthStore } from '../../store/authStore';
import { useTasks } from '../../hooks/queries/useTasks';
import { useProjects } from '../../hooks/queries/useProjects';
import { useProfile } from '../../hooks/queries/useProfile';

// Мокаем стор и хуки
jest.mock('../../store/authStore');
jest.mock('../../hooks/queries/useTasks');
jest.mock('../../hooks/queries/useProjects');
jest.mock('../../hooks/queries/useProfile');

const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
};

const mockTasks = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Test Task 1',
    completed: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Test Task 2',
    completed: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockProjects = [
  {
    id: 'project1',
    user_id: 'user1',
    name: 'Test Project',
    description: 'Test Description',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

const mockProfile = {
  id: 'user1',
  full_name: 'Test User',
  avatar_url: null,
  storage_used: 0,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Отключаем retries для тестов
    },
  },
});

// Обертываем компонент в QueryClientProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('TodoDashboard Component', () => {
  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      checkSession: jest.fn(),
      signOut: jest.fn(),
    });

    (useTasks as jest.Mock).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
    });

    (useProjects as jest.Mock).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
    });

    (useProfile as jest.Mock).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
    });
  });

  it('renders dashboard with user info', async () => {
    renderWithProviders(<TodoDashboard onSignOut={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Lumi')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('displays tasks when data is loaded', async () => {
    renderWithProviders(<TodoDashboard onSignOut={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('displays projects when data is loaded', async () => {
    renderWithProviders(<TodoDashboard onSignOut={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('filters tasks based on current view', async () => {
    renderWithProviders(<TodoDashboard onSignOut={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Проверяем переключение вида
    const allButton = screen.getByText('all');
    fireEvent.click(allButton);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
  });

  it('allows adding new tasks', async () => {
    renderWithProviders(<TodoDashboard onSignOut={jest.fn()} />);

    // Вводим новую задачу
    const taskInput = screen.getByPlaceholderText(/Add a new task/i);
    fireEvent.change(taskInput, { target: { value: 'New Test Task' } });

    // Нажимаем кнопку добавления
    const addButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(taskInput).toHaveValue('');
    });
  });
});
