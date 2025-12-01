// src/lib/errors/ErrorHandler.ts
import { AppError, ErrorType } from './errorTypes';

export class ErrorHandler {
  static handle(error: any): AppError {
    // Определяем тип ошибки на основе различных признаков

    // Проверяем, является ли ошибка ошибкой сети
    if (this.isNetworkError(error)) {
      return {
        type: ErrorType.NetworkError,
        message: error.message || 'Network error occurred',
        originalError: error,
        status: error.status || 0,
      };
    }

    // Проверяем, является ли ошибка ошибкой авторизации
    if (this.isAuthError(error)) {
      return {
        type: ErrorType.AuthError,
        message: error.message || 'Authentication error',
        originalError: error,
        status: error.status || 401,
      };
    }

    // Проверяем, является ли ошибка ошибкой валидации
    if (this.isValidationError(error)) {
      return {
        type: ErrorType.ValidationError,
        message: error.message || 'Validation error',
        originalError: error,
      };
    }

    // Проверяем, является ли ошибка ошибкой квоты
    if (this.isQuotaError(error)) {
      return {
        type: ErrorType.QuotaError,
        message: error.message || 'Quota limit exceeded',
        originalError: error,
        status: error.status || 403,
      };
    }

    // Проверяем, является ли ошибка ошибкой "не найдено"
    if (this.isNotFoundError(error)) {
      return {
        type: ErrorType.NotFoundError,
        message: error.message || 'Resource not found',
        originalError: error,
        status: error.status || 404,
      };
    }

    // Проверяем, является ли ошибка ошибкой конфликта
    if (this.isConflictError(error)) {
      return {
        type: ErrorType.ConflictError,
        message: error.message || 'Resource conflict',
        originalError: error,
        status: error.status || 409,
      };
    }

    // Проверяем, является ли ошибка серверной ошибкой
    if (this.isServerError(error)) {
      return {
        type: ErrorType.ServerError,
        message: error.message || 'Server error occurred',
        originalError: error,
        status: error.status || 500,
      };
    }

    // Если не удается определить конкретный тип ошибки
    return {
      type: ErrorType.UnknownError,
      message: error.message || 'An unknown error occurred',
      originalError: error,
    };
  }

  private static isNetworkError(error: any): boolean {
    return (
      error.name === 'NetworkError' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine
    );
  }

  private static isAuthError(error: any): boolean {
    return (
      error.status === 401 ||
      error.status === 403 ||
      error.message?.includes('unauthorized') ||
      error.message?.includes('authentication')
    );
  }

  private static isValidationError(error: any): boolean {
    return (
      error.status === 422 ||
      error.message?.includes('validation') ||
      error.message?.includes('invalid')
    );
  }

  private static isQuotaError(error: any): boolean {
    return (
      error.status === 429 || error.message?.includes('quota') || error.message?.includes('limit')
    );
  }

  private static isNotFoundError(error: any): boolean {
    return (
      error.status === 404 ||
      error.message?.includes('not found') ||
      error.message?.includes('does not exist')
    );
  }

  private static isConflictError(error: any): boolean {
    return (
      error.status === 409 ||
      error.message?.includes('conflict') ||
      error.message?.includes('duplicate')
    );
  }

  private static isServerError(error: any): boolean {
    return error.status && error.status >= 500 && error.status < 600;
  }
}
