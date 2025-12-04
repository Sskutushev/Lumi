// src/hooks/__tests__/useClickOutside.test.ts
import { renderHook } from '@testing-library/react';
import { useClickOutside } from '../useClickOutside';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('useClickOutside', () => {
  it('should call the handler when clicking outside the element', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useClickOutside(ref, handler));

    // Simulate a click outside
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call the handler when clicking inside the element', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    const child = document.createElement('span');
    ref.current.appendChild(child);

    renderHook(() => useClickOutside(ref, handler));

    // Simulate a click inside
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });
});
