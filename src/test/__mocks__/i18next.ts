// src/test/__mocks__/i18next.ts
import { vi } from 'vitest';

const translations: Record<string, string> = {
  'todo.closeModal': 'Close modal',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'todo.moreOptions': 'More options',
  'todo.addTaskPlaceholder': 'Add a new task...',
  'common.add': 'Add',
  'todo.searchPlaceholder': 'Search tasks...',
  'todo.advancedFilters': 'Advanced filters',
  'todo.filters': 'Filters',
  'empty.action': 'Perform Action', // Generic action text for empty state
};

export const useTranslation = () => ({
  t: (key: string) => translations[key] || key,
  i18n: {
    changeLanguage: () => new Promise(() => {}),
    language: 'en',
  },
});

vi.mock('react-i18next', () => ({
  useTranslation,
}));
