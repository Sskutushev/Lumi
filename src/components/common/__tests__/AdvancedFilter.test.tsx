// src/components/common/__tests__/AdvancedFilter.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import AdvancedFilter from '../AdvancedFilter';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

const mockFilters = {
  priority: null,
  project_id: null,
  status: 'all',
  dateRange: null,
  assignee: null,
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

describe('AdvancedFilter', () => {
  it('should open and close the filter menu', () => {
    const onFiltersChange = vi.fn();
    render(
      <AdvancedFilter projects={[]} filters={mockFilters} onFiltersChange={onFiltersChange} />
    );

    const filterButton = screen.getByLabelText('Advanced filters');
    fireEvent.click(filterButton);

    expect(screen.getByText('Advanced filters')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('common.close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Advanced filters')).not.toBeInTheDocument();
  });

  it('should call onFiltersChange when a filter is changed', () => {
    const onFiltersChange = vi.fn();
    render(
      <AdvancedFilter projects={[]} filters={mockFilters} onFiltersChange={onFiltersChange} />
    );

    const filterButton = screen.getByLabelText('Advanced filters');
    fireEvent.click(filterButton);

    // Test changing a filter - let's change the status filter
    const statusButtons = screen.getAllByRole('button');
    const pendingButton =
      statusButtons.find((btn) => btn.textContent?.includes('pending')) ||
      screen.getByText('todo.pending');
    fireEvent.click(pendingButton);

    expect(onFiltersChange).toHaveBeenCalledWith({ ...mockFilters, status: 'pending' });
  });
});
