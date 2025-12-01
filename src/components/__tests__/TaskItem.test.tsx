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

  // --- Existing Tests ---
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
    expect(screen.getByText('todo.priority.medium')).toBeInTheDocument();
  });

  it('displays due date when due_date is set', () => {
    renderTaskItem(mockTask);
    expect(screen.getByText('2023-12-31')).toBeInTheDocument();
  });

  it('shows edit and delete options in dropdown', async () => {
    renderTaskItem(mockTask);
    const moreOptionsButton = screen.getByLabelText('todo.moreOptions');
    fireEvent.click(moreOptionsButton);
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

  // --- New Tests ---
  it('allows for inline title editing', async () => {
    renderTaskItem(mockTask);

    const titleElement = screen.getByText('Test Task');
    fireEvent.click(titleElement);

    const inputElement = await screen.findByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('Test Task');

    fireEvent.change(inputElement, { target: { value: 'Updated Test Task' } });
    fireEvent.blur(inputElement);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', { title: 'Updated Test Task' });
    });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('applies overdue styles for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      completed: false,
      due_date: new Date(Date.now() - 86400000).toISOString(),
    };
    const { container } = renderTaskItem(overdueTask);
    const listItem = container.querySelector('[role="listitem"]');
    expect(listItem).toHaveClass('glow-error');
  });

  it('does not render date or priority if they are not provided', () => {
    const simpleTask = { ...mockTask, due_date: null, priority: null };
    renderTaskItem(simpleTask);
    expect(screen.queryByText('2023-12-31')).not.toBeInTheDocument();
    expect(screen.queryByText('todo.priority.medium')).not.toBeInTheDocument();
  });

  it('activates editing on Enter key press on the title', async () => {
    renderTaskItem(mockTask);
    const titleElement = screen.getByText('Test Task');
    fireEvent.keyDown(titleElement, { key: 'Enter', code: 'Enter' });
    const inputElement = await screen.findByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });
});
