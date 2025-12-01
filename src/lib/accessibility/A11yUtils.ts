// src/lib/accessibility/A11yUtils.ts
import { RefObject } from 'react';

// Утилиты для улучшения доступности
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

  // Фокус на первый элемент при активации
  firstElement.focus();

  // Возвращаем фокус на предыдущий элемент при очистке
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

// Утилита для скрытия элемента от скринридера
export const hideFromScreenReader = (element: HTMLElement) => {
  element.setAttribute('aria-hidden', 'true');
};

// Утилита для показа элемента скринридеру
export const showToScreenReader = (element: HTMLElement) => {
  element.removeAttribute('aria-hidden');
};

// Утилита для улучшения контрастности
export const ensureColorContrast = (color: string, backgroundColor: string): boolean => {
  // Простая проверка контрастности (упрощенный алгоритм)
  // В реальном проекте можно использовать библиотеку a11y для точной проверки
  const colorBrightness = getBrightness(color);
  const bgBrightness = getBrightness(backgroundColor);
  const contrastRatio = Math.abs(colorBrightness - bgBrightness) / 255;

  // Минимальный контраст для обычного текста (3:1)
  return contrastRatio >= 0.3;
};

const getBrightness = (color: string): number => {
  // Упрощенный расчет яркости
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  return 128; // значение по умолчанию
};
