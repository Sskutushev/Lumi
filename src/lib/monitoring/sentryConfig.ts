// src/lib/monitoring/sentryConfig.ts
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { Replay } from '@sentry/replay';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN || '', // В реальном проекте нужно использовать реальный DSN
      integrations: [
        new Integrations.BrowserTracing(),
        new Replay({
          // Приватность: не записываем чувствительные данные
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Включение трейсов для измерения производительности
      tracesSampleRate: 0.1, // 10% трейсов в production

      // Включение replay для воспроизведения сессий (при ошибке)
      replaysSessionSampleRate: 0.1, // 10% сессий
      replaysOnErrorSampleRate: 1.0, // 100% при ошибках

      // Настройки окружения
      environment: process.env.NODE_ENV || 'development',

      // Фильтрация ошибок
      beforeSend(event) {
        // Пример фильтрации определенных типов ошибок
        if (event.message?.includes('ResizeObserver loop limit exceeded')) {
          return null; // Отфильтровать эту ошибку
        }

        // Добавить пользовательские теги
        if (window.location.hostname === 'localhost') {
          event.tags = {
            ...event.tags,
            environment: 'development',
          };
        }

        return event;
      },
    });
  }
};

export { Sentry };
