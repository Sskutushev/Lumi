// src/lib/errors/__tests__/ErrorHandler.test.ts
import { ErrorHandler } from '../ErrorHandler';
import { ErrorType } from '../errorTypes';

describe('ErrorHandler', () => {
  it('should identify network errors', () => {
    const networkErrors = [
      { name: 'NetworkError', message: 'Network Error' },
      { message: 'Network Error occurred' },
      { message: 'Failed to fetch' },
    ];

    networkErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.NetworkError);
    });
  });

  it('should identify authentication errors', () => {
    const authErrors = [
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { message: 'unauthorized access' },
      { message: 'authentication failed' },
    ];

    authErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.AuthError);
    });
  });

  it('should identify validation errors', () => {
    const validationErrors = [
      { status: 422, message: 'Validation failed' },
      { message: 'validation error occurred' },
      { message: 'invalid input' },
    ];

    validationErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.ValidationError);
    });
  });

  it('should identify quota errors', () => {
    const quotaErrors = [
      { status: 429, message: 'Too many requests' },
      { message: 'quota limit exceeded' },
      { message: 'rate limit exceeded' },
    ];

    quotaErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.QuotaError);
    });
  });

  it('should identify not found errors', () => {
    const notFoundErrors = [
      { status: 404, message: 'Not found' },
      { message: 'resource not found' },
      { message: 'does not exist' },
    ];

    notFoundErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.NotFoundError);
    });
  });

  it('should identify conflict errors', () => {
    const conflictErrors = [
      { status: 409, message: 'Conflict' },
      { message: 'conflict occurred' },
      { message: 'duplicate entry' },
    ];

    conflictErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.ConflictError);
    });
  });

  it('should identify server errors', () => {
    const serverErrors = [
      { status: 500, message: 'Internal Server Error' },
      { status: 502, message: 'Bad Gateway' },
      { status: 503, message: 'Service Unavailable' },
    ];

    serverErrors.forEach((error) => {
      const result = ErrorHandler.handle(error);
      expect(result.type).toBe(ErrorType.ServerError);
    });
  });

  it('should return unknown error for unrecognized errors', () => {
    const unknownError = { message: 'Some unknown error' };
    const result = ErrorHandler.handle(unknownError);

    expect(result.type).toBe(ErrorType.UnknownError);
    expect(result.message).toBe('Some unknown error');
  });

  it('should handle error with no message', () => {
    const errorWithoutMessage = {};
    const result = ErrorHandler.handle(errorWithoutMessage);

    expect(result.type).toBe(ErrorType.UnknownError);
    expect(result.message).toBe('An unknown error occurred');
  });

  it('should preserve original error object', () => {
    const originalError = { status: 404, message: 'Not found', customProp: 'value' };
    const result = ErrorHandler.handle(originalError);

    expect(result.originalError).toEqual(originalError);
  });
});
