// src/lib/security/securityUtils.ts
import { z } from 'zod';

// Валидационные схемы для безопасности
export const userInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
});

export const taskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  due_date: z.string().datetime().optional(),
  project_id: z.string().nullable().optional(),
});

export const projectInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Утилиты для очистки пользовательского ввода
export const sanitizeInput = (input: string): string => {
  // Удаляем потенциально опасные символы
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Удаление скриптов
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Удаление iframe
    .replace(/javascript:/gi, '') // Удаление javascript: ссылок
    .replace(/on\w+="[^"]*"/gi, '') // Удаление обработчиков событий
    .trim();
};

// Утилита для валидации пользовательского ввода
export const validateUserInput = (data: any, schema: z.ZodSchema) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
    }
    throw error;
  }
};

// Утилита для проверки токена
export const validateToken = (token: string): boolean => {
  // Проверяем, является ли токен валидным JWT
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Декодируем payload (вторую часть JWT)
    const payload = JSON.parse(atob(parts[1]));

    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // Проверяем, есть ли необходимые поля
    if (!payload.sub || !payload.iat) {
      return false;
    }

    return true;
  } catch (e) {
    console.error('Token validation error:', e);
    return false;
  }
};

// Утилита для проверки URL
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (e) {
    return false;
  }
};

// Утилита для хеширования чувствительных данных (клиентская часть)
export const hashSensitiveData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Утилита для проверки CSRF токена
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  // В реальном приложении токен должен совпадать с серверным
  return token === expectedToken;
};

// Утилита для безопасного хранения данных в localStorage
export const secureLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      // В реальном приложении можно зашифровать данные перед сохранением
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to set item in localStorage:', e);
    }
  },

  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Failed to get item from localStorage:', e);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove item from localStorage:', e);
    }
  },
};

// Утилита для проверки размера файлов
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Утилита для проверки типа файла
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(
    (type) => file.type === type || file.name.toLowerCase().endsWith(type.replace('image/', '.'))
  );
};
