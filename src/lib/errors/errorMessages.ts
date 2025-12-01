// src/lib/errors/errorMessages.ts
import { ErrorType } from './errorTypes';

export const errorMessages: Record<ErrorType, Record<string, string>> = {
  [ErrorType.NetworkError]: {
    en: 'Network error occurred. Please check your connection and try again.',
    ru: 'Произошла сетевая ошибка. Пожалуйста, проверьте подключение и попробуйте снова.',
  },
  [ErrorType.AuthError]: {
    en: 'Authentication error. Please sign in again.',
    ru: 'Ошибка аутентификации. Пожалуйста, войдите снова.',
  },
  [ErrorType.ValidationError]: {
    en: 'Validation error. Please check your input.',
    ru: 'Ошибка валидации. Пожалуйста, проверьте введенные данные.',
  },
  [ErrorType.QuotaError]: {
    en: 'Quota limit exceeded. Please upgrade your plan or try later.',
    ru: 'Превышено ограничение по квоте. Пожалуйста, обновите тариф или попробуйте позже.',
  },
  [ErrorType.NotFoundError]: {
    en: 'Resource not found.',
    ru: 'Ресурс не найден.',
  },
  [ErrorType.ConflictError]: {
    en: 'Resource conflict. This item already exists.',
    ru: 'Конфликт ресурсов. Этот элемент уже существует.',
  },
  [ErrorType.ServerError]: {
    en: 'Server error occurred. Please try again later.',
    ru: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.',
  },
  [ErrorType.UnknownError]: {
    en: 'An unexpected error occurred. Please try again.',
    ru: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.',
  },
};
