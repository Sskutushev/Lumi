// src/lib/errors/errorTypes.ts
export enum ErrorType {
  NetworkError = 'NETWORK_ERROR',
  AuthError = 'AUTH_ERROR',
  ValidationError = 'VALIDATION_ERROR',
  QuotaError = 'QUOTA_ERROR',
  NotFoundError = 'NOT_FOUND_ERROR',
  ConflictError = 'CONFLICT_ERROR',
  ServerError = 'SERVER_ERROR',
  UnknownError = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  status?: number;
  url?: string;
}
