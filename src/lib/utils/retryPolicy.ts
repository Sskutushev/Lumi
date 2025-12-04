// src/lib/utils/retryPolicy.ts

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Network errors from fetch/XMLHttpRequest
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Network errors from Supabase
  if (error.status === 0 || error.status >= 500) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true;
  }

  // Other signs of network errors
  if (
    error.message &&
    (error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('TypeError'))
  ) {
    return true;
  }

  return false;
};

export const isAuthError = (error: any): boolean => {
  if (!error) return false;

  // Do not retry on auth errors
  if (error.status === 401 || error.status === 403) {
    return true;
  }

  return false;
};

export const isValidationError = (error: any): boolean => {
  if (!error) return false;

  // Do not retry on validation errors
  if (error.status === 400 || error.status === 422) {
    return true;
  }

  return false;
};

export const isQuotaError = (error: any): boolean => {
  if (!error) return false;

  // Do not retry on quota errors
  if (error.status === 429) {
    return true;
  }

  return false;
};

export const isNotFoundError = (error: any): boolean => {
  if (!error) return false;

  // Do not retry on 'not found' errors
  if (error.status === 404) {
    return true;
  }

  return false;
};

export const isConflictError = (error: any): boolean => {
  if (!error) return false;

  // Do not retry on conflict errors
  if (error.status === 409) {
    return true;
  }

  return false;
};

export const isServerError = (error: any): boolean => {
  if (!error) return false;

  // Retry on 5xx server errors
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  return false;
};

// Determines if a request should be retried
export const shouldRetry = (error: any, attemptIndex: number, maxAttempts: number = 3): boolean => {
  if (attemptIndex >= maxAttempts) {
    return false;
  }

  if (isAuthError(error)) {
    return false;
  }

  if (isValidationError(error)) {
    return false;
  }

  if (isQuotaError(error)) {
    return false;
  }

  if (isNotFoundError(error)) {
    return false;
  }

  if (isConflictError(error)) {
    return false;
  }

  // Retry on network or server errors
  return isNetworkError(error) || isServerError(error);
};

// Gets the retry delay with jitter
export const getRetryDelay = (attemptIndex: number): number => {
  // Exponential backoff: 1s, 2s, 4s...
  const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000); // Max 30 seconds

  // Jitter: 50%-100% of the base delay
  const jitter = 0.5 + Math.random() * 0.5;

  return baseDelay * jitter;
};
