// src/components/layout/__tests__/TaskDetailsPopup.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import TaskDetailsPopup from '../TaskDetailsPopup';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  user_id: 'user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('TaskDetailsPopup', () => {
  it('should render task details and call onClose', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(<TaskDetailsPopup task={mockTask} projects={[]} onClose={onClose} onSave={onSave} />);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave when save button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(<TaskDetailsPopup task={mockTask} projects={[]} onClose={onClose} onSave={onSave} />);

    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Task' }));
  });
});
