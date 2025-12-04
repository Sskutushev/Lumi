// src/lib/errors/logger.ts
export class Logger {
  static log(level: 'error' | 'warn' | 'info' | 'debug', message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (meta) {
      console.log(logMessage, meta);
    } else {
      console.log(logMessage);
    }

    // In production, logs can be sent to an external service
    if (process.env.NODE_ENV === 'production') {
      // Example: send logs to Sentry or another service
      // logToExternalService(level, message, meta);
    }
  }

  static error(message: string, error?: any): void {
    // Don't log AbortError if it's expected (for example, during component unmount)
    if (error) {
      // Check if this is an AbortError in various forms
      const isAbortError =
        (error as any).name === 'AbortError' ||
        (typeof error === 'object' && error.message && error.message.includes('AbortError')) ||
        (typeof error === 'string' && error.includes('AbortError'));

      if (isAbortError) {
        return; // Skip logging AbortError
      }
    }
    Logger.log('error', message, error);
  }

  static warn(message: string, meta?: any): void {
    Logger.log('warn', message, meta);
  }

  static info(message: string, meta?: any): void {
    Logger.log('info', message, meta);
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      Logger.log('debug', message, meta);
    }
  }
}
