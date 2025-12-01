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

    // В продакшене можно отправлять логи в соответствующий сервис
    if (process.env.NODE_ENV === 'production') {
      // Пример: отправка логов в Sentry или другой сервис
      // logToExternalService(level, message, meta);
    }
  }

  static error(message: string, error?: any): void {
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
