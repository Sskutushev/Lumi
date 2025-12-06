// src/components/common/__tests__/EmptyState.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key itself for testing
  }),
}));

describe('EmptyState', () => {
  it('should render the title and description', () => {
    render(<EmptyState title="empty.title" description="empty.description" />);

    expect(screen.getByText('empty.title')).toBeInTheDocument();
    expect(screen.getByText('empty.description')).toBeInTheDocument();
  });

  it('should render an action button if provided', () => {
    const onAction = vi.fn();
    const actionButton = <button onClick={onAction}>empty.action</button>;

    render(
      <EmptyState title="empty.title" description="empty.description" action={actionButton} />
    );

    const button = screen.getByText('empty.action');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
