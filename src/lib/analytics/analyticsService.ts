// src/lib/analytics/analyticsService.ts
import { performanceLogger } from '../monitoring/performanceLogger';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize(userId?: string) {
    this.isInitialized = true;
    this.userId = userId || null;

    // Start performance logging
    performanceLogger.logPagePerformance();
  }

  // Track a custom event
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    // Log to console in dev mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('Analytics event:', event);
    }

    // Integration with Google Analytics, Yandex Metrika, etc. can be added here
    this.sendToExternalServices(event);
  }

  // Track a user action
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.trackEvent({
      name: 'user_action',
      properties: {
        action,
        userId: this.userId,
        ...properties,
      },
      timestamp: Date.now(),
    });
  }

  // Track a page view
  trackPageView(path: string, properties?: Record<string, any>) {
    this.trackEvent({
      name: 'page_view',
      properties: {
        path,
        userId: this.userId,
        ...properties,
      },
      timestamp: Date.now(),
    });
  }

  // Track an error
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        userId: this.userId,
        context,
        timestamp: Date.now(),
      },
    });
  }

  // Track a performance measurement
  trackPerformance(measureName: string, duration: number, properties?: Record<string, any>) {
    this.trackEvent({
      name: 'performance',
      properties: {
        measureName,
        duration,
        userId: this.userId,
        ...properties,
      },
      timestamp: Date.now(),
    });
  }

  private sendToExternalServices(event: AnalyticsEvent) {
    // In a real application, this is where you would send data to Google Analytics, Yandex Metrika, etc.
    // Example integration with an existing metric service:
    if (typeof window !== 'undefined' && (window as any).ym && process.env.VITE_YM_COUNTER_ID) {
      // Send to Yandex.Metrika
      (window as any).ym(process.env.VITE_YM_COUNTER_ID, 'reachGoal', event.name, event.properties);
    }

    // Other analytics services can be added here
  }

  // Get user ID
  getUserId(): string | null {
    return this.userId;
  }

  // Set user ID
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Reset user data
  resetUser() {
    this.userId = null;
  }
}

export const analyticsService = AnalyticsService.getInstance();
