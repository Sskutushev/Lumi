// src/lib/monitoring/sentryConfig.ts
import * as Sentry from '@sentry/react';
import { Replay } from '@sentry/replay';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN || '', // In a real project, use a real DSN
      integrations: [
        // new BrowserTracing(), // Temporarily disabled due to type incompatibility
        new Replay({
          // Privacy: do not record sensitive data
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Enable traces for performance measurement
      tracesSampleRate: 0.1, // 10% of traces in production

      // Enable replay for session playback (on error)
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% on errors

      // Environment settings
      environment: process.env.NODE_ENV || 'development',

      // Error filtering
      beforeSend(event) {
        // Example of filtering specific error types
        if (event.message?.includes('ResizeObserver loop limit exceeded')) {
          return null; // Filter out this error
        }

        // Add custom tags
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
