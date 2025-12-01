// src/lib/monitoring/performanceLogger.ts
import { Sentry } from './sentryConfig';

// Утилита для измерения производительности
class PerformanceLogger {
  private static instance: PerformanceLogger;
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  // Установка метки времени
  setMark(name: string) {
    this.marks.set(name, performance.now());
  }

  // Измерение времени между метками
  measure(startMark: string, endMark: string, operationName: string) {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);

    if (startTime !== undefined && endTime !== undefined) {
      const duration = endTime - startTime;
      this.measures.set(operationName, duration);

      // Отправка в Sentry если в production
      if (process.env.NODE_ENV === 'production') {
        Sentry.metrics.distribution('app.performance.operation_duration', duration, {
          tags: { operation: operationName },
        });
      }

      return duration;
    }
    return null;
  }

  // Логирование времени выполнения функции
  async measureFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.setMark(`${name}_start`);
    try {
      const result = await fn();
      this.setMark(`${name}_end`);
      this.measure(`${name}_start`, `${name}_end`, name);
      return result;
    } catch (error) {
      this.setMark(`${name}_end`);
      this.measure(`${name}_start`, `${name}_end`, name);
      throw error;
    }
  }

  // Логирование времени загрузки ресурсов
  logResourceTiming() {
    if (performance.getEntriesByType('resource').length > 0) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      resources.forEach((resource) => {
        const tags = {
          name: resource.name.split('/').pop() || 'unknown',
          type: resource.initiatorType,
        };

        if (process.env.NODE_ENV === 'production') {
          Sentry.metrics.distribution('app.performance.resource_load_time', resource.duration, {
            tags,
          });
        }
      });
    }
  }

  // Логирование метрик производительности страницы
  logPagePerformance() {
    // Ожидание загрузки всех ресурсов
    window.addEventListener('load', () => {
      setTimeout(() => {
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          if (process.env.NODE_ENV === 'production') {
            Sentry.metrics.distribution('app.performance.fcp', fcpEntry.startTime);
          }
        }

        // Largest Contentful Paint
        const lcpEntry = paintEntries.find((entry) => entry.name === 'largest-contentful-paint');
        if (lcpEntry) {
          if (process.env.NODE_ENV === 'production') {
            Sentry.metrics.distribution('app.performance.lcp', lcpEntry.startTime);
          }
        }

        // Log resource timing
        this.logResourceTiming();
      }, 0);
    });
  }

  // Получить все измерения
  getMeasures() {
    return new Map(this.measures);
  }

  // Сбросить все измерения
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

export const performanceLogger = PerformanceLogger.getInstance();
