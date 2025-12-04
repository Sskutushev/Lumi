// src/lib/errors/ErrorHandler.ts
import { AppError, ErrorType } from './errorTypes';

export class ErrorHandler {
  static handle(error: any): AppError {
    // Determine error type based on various signatures

    // Check for network errors
    if (this.isNetworkError(error)) {
      return {
        type: ErrorType.NetworkError,
        message: error.message || 'Network error occurred',
        originalError: error,
        status: error.status || 0,
      };
    }

    // Check for authentication errors
    if (this.isAuthError(error)) {
      return {
        type: ErrorType.AuthError,
        message: error.message || 'Authentication error',
        originalError: error,
        status: error.status || 401,
      };
    }

    // Check for validation errors
    if (this.isValidationError(error)) {
      return {
        type: ErrorType.ValidationError,
        message: error.message || 'Validation error',
        originalError: error,
      };
    }

    // Check for quota errors
    if (this.isQuotaError(error)) {
      return {
        type: ErrorType.QuotaError,
        message: error.message || 'Quota limit exceeded',
        originalError: error,
        status: error.status || 403,
      };
    }

    // Check for not found errors
    if (this.isNotFoundError(error)) {
      return {
        type: ErrorType.NotFoundError,
        message: error.message || 'Resource not found',
        originalError: error,
        status: error.status || 404,
      };
    }

    // Check for conflict errors
    if (this.isConflictError(error)) {
      return {
        type: ErrorType.ConflictError,
        message: error.message || 'Resource conflict',
        originalError: error,
        status: error.status || 409,
      };
    }

    // Check for server errors
    if (this.isServerError(error)) {
      return {
        type: ErrorType.ServerError,
        message: error.message || 'Server error occurred',
        originalError: error,
        status: error.status || 500,
      };
    }

    // Fallback for unknown errors
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
