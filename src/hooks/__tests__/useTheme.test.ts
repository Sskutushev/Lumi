// src/hooks/__tests__/useTheme.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('should initialize with system theme if no theme is stored', () => {
    const { result } = renderHook(() => useTheme());
    // Note: JSDOM default for prefers-color-scheme is 'light'
    expect(result.current.theme).toBe('light');
  });

  it('should initialize with stored theme', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
