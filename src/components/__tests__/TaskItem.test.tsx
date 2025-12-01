// src/components/__tests__/TaskItem.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TaskItem from '../TaskItem';
import { Task } from '../../types/api.types';

// Мокаем react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Возвращаем ключ вместо перевода
  }),
}));

// Мокаем хуки и зависимости
const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();
const mockOnToggleComplete = vi.fn();
const mockOnEditDetails = vi.fn();

const mockTask: Task = {
  id: '1',
  user_id: 'user1',
  title: 'Test Task',
  description: 'Test description',
  detailed_description: null,
  completed: false,
  priority: 'medium',
  start_date: null,
  due_date: '2023-12-31',
  project_id: 'project1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

// Обертка для рендера, если понадобится контекст
const renderTaskItem = (task: Task) => {
  return render(
    <TaskItem
      task={task}
      onUpdate={mockOnUpdate}
      onDelete={mockOnDelete}
      onToggleComplete={mockOnToggleComplete}
      onEditDetails={mockOnEditDetails}
    />
  );
};

describe('TaskItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title correctly', () => {
    renderTaskItem(mockTask);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    renderTaskItem(mockTask);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('displays priority badge when priority is set', () => {
    renderTaskItem(mockTask);
    // Используем t() для получения ключа, который и будет отрендерен
    expect(screen.getByText('todo.priority.medium')).toBeInTheDocument();
  });

  it('displays due date when due_date is set', () => {
    renderTaskItem(mockTask);
    expect(screen.getByText('2023-12-31')).toBeInTheDocument();
  });

  it('shows edit and delete options in dropdown', async () => {
    renderTaskItem(mockTask);

    // Используем aria-label для надежного поиска кнопки
    const moreOptionsButton = screen.getByLabelText('todo.moreOptions');
    fireEvent.click(moreOptionsButton);

    // Ожидаем появления кнопок в меню
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'common.edit' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'common.delete' })).toBeInTheDocument();
    });
  });

  it('calls onEditDetails when edit option is clicked', async () => {
    renderTaskItem(mockTask);

    const moreOptionsButton = screen.getByLabelText('todo.moreOptions');
    fireEvent.click(moreOptionsButton);

    const editButton = await screen.findByRole('menuitem', { name: 'common.edit' });
    fireEvent.click(editButton);

    expect(mockOnEditDetails).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete option is clicked', async () => {
    renderTaskItem(mockTask);

    const moreOptionsButton = screen.getByLabelText('todo.moreOptions');
    fireEvent.click(moreOptionsButton);

    const deleteButton = await screen.findByRole('menuitem', { name: 'common.delete' });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('renders completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true };
    renderTaskItem(completedTask);

    const taskTitle = screen.getByText('Test Task');
    expect(taskTitle).toHaveClass('line-through');
  });
});
