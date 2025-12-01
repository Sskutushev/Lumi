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

    // Запуск логирования производительности
    performanceLogger.logPagePerformance();
  }

  // Отправка события
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    // Логируем в консоль в dev режиме
    if (process.env.NODE_ENV !== 'production') {
      console.log('Analytics event:', event);
    }

    // Здесь можно добавить интеграцию с Google Analytics, Yandex Metrika и т.д.
    this.sendToExternalServices(event);
  }

  // Отправка данных о пользовательском действии
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

  // Отправка данных о просмотре страницы
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

  // Отправка данных об ошибке
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

  // Отправка данных о выполнении операции
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
    // В реальном приложении здесь будет отправка в Google Analytics, Yandex Metrika и т.д.
    // Пример интеграции с существующей метрикой:
    if (typeof window !== 'undefined' && (window as any).ym && process.env.VITE_YM_COUNTER_ID) {
      // Отправка в Яндекс.Метрику
      (window as any).ym(process.env.VITE_YM_COUNTER_ID, 'reachGoal', event.name, event.properties);
    }

    // Также можно добавить другие сервисы аналитики
  }

  // Получить ID пользователя
  getUserId(): string | null {
    return this.userId;
  }

  // Установить ID пользователя
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Сбросить данные пользователя
  resetUser() {
    this.userId = null;
  }
}

export const analyticsService = AnalyticsService.getInstance();
