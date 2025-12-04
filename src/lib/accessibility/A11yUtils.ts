// src/lib/accessibility/A11yUtils.ts
import { RefObject } from 'react';

// Utilities for improving accessibility
export const focusFirstElement = (containerRef: RefObject<HTMLElement>) => {
  if (containerRef.current) {
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }
};

export const focusTrap = (containerRef: RefObject<HTMLElement>, returnFocusTo?: HTMLElement) => {
  if (!containerRef.current) return;

  const focusableElements = containerRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Focus the first element on activation
  firstElement.focus();

  // Return focus to the previous element on cleanup
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    if (returnFocusTo) {
      returnFocusTo.focus();
    }
  };
};

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Utility to hide an element from screen readers
export const hideFromScreenReader = (element: HTMLElement) => {
  element.setAttribute('aria-hidden', 'true');
};

// Utility to show an element to screen readers
export const showToScreenReader = (element: HTMLElement) => {
  element.removeAttribute('aria-hidden');
};

// Utility to check color contrast
export const ensureColorContrast = (color: string, backgroundColor: string): boolean => {
  // Simple contrast check (simplified algorithm)
  // For a real project, a library like 'a11y-color-contrast' would be better
  const colorBrightness = getBrightness(color);
  const bgBrightness = getBrightness(backgroundColor);
  const contrastRatio = Math.abs(colorBrightness - bgBrightness) / 255;

  // Minimum contrast for normal text (3:1)
  return contrastRatio >= 0.3;
};

const getBrightness = (color: string): number => {
  // Simplified brightness calculation
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  return 128; // Default value
};
