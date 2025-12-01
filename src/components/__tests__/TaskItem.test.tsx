// src/components/__tests__/TaskItem.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from '../layout/TaskItem'; // Путь к компоненту TaskItem
import { Task } from '../../types/api.types';

// Мокаем хуки и зависимости
const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();
const mockOnToggleComplete = jest.fn();
const mockOnEditDetails = jest.fn();

const mockTask: Task = {
  id: '1',
  user_id: 'user1',
  title: 'Test Task',
  completed: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  priority: 'medium',
  due_date: '2023-12-31',
  project_id: 'project1',
  description: 'Test description',
};

describe('TaskItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    const checkbox = screen.getByRole('button');
    fireEvent.click(checkbox);

    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('displays priority badge when priority is set', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('displays due date when due_date is set', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    expect(screen.getByText('2023-12-31')).toBeInTheDocument();
  });

  it('shows edit and delete options in dropdown', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    const moreOptionsButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreOptionsButton);

    await waitFor(() => {
      expect(screen.getByText('edit')).toBeInTheDocument();
      expect(screen.getByText('delete')).toBeInTheDocument();
    });
  });

  it('calls onEditDetails when edit option is clicked', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    const moreOptionsButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreOptionsButton);

    await waitFor(() => {
      const editButton = screen.getByText('edit');
      fireEvent.click(editButton);
    });

    expect(mockOnEditDetails).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete option is clicked', async () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    const moreOptionsButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreOptionsButton);

    await waitFor(() => {
      const deleteButton = screen.getByText('delete');
      fireEvent.click(deleteButton);
    });

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('renders completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onEditDetails={mockOnEditDetails}
      />
    );

    const taskTitle = screen.getByText('Test Task');
    expect(taskTitle).toHaveClass('line-through');
  });
});
