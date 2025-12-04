// src/components/common/__tests__/AdvancedFilter.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { AdvancedFilter } from '../AdvancedFilter';
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

    expect(screen.getByText('Search')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('should call onFiltersChange when a filter is changed', () => {
    const onFiltersChange = vi.fn();
    render(
      <AdvancedFilter projects={[]} filters={mockFilters} onFiltersChange={onFiltersChange} />
    );

    const filterButton = screen.getByLabelText('Advanced filters');
    fireEvent.click(filterButton);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(onFiltersChange).toHaveBeenCalledWith({ ...mockFilters, searchQuery: 'Test' });
  });
});
