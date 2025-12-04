// src/lib/security/securityUtils.ts
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Security validation schemas
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

// Utilities for sanitizing user input
export const sanitizeInput = (input: string): string => {
  // Use DOMPurify to sanitize input. If DOMPurify is not available, return an empty string for safety.
  if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    return sanitized.trim();
  }
  // Fallback: if DOMPurify is not available for some reason, return empty string.
  return '';
};

// Utility for validating user input
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

// Utility for token validation
export const validateToken = (token: string): boolean => {
  // Check if the token is a valid JWT
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Decode the payload (second part of JWT)
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // Check for required fields
    if (!payload.sub || !payload.iat) {
      return false;
    }

    return true;
  } catch (e) {
    console.error('Token validation error:', e);
    return false;
  }
};

// Utility to check URL validity
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (e) {
    return false;
  }
};

// Utility for client-side hashing of sensitive data
export const hashSensitiveData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Utility for CSRF token validation
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  // In a real application, the token should match the one on the server
  return token === expectedToken;
};

// Utility for secure localStorage access
export const secureLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      // In a real application, data could be encrypted before saving
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

// Utility to validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Utility to validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(
    (type) => file.type === type || file.name.toLowerCase().endsWith(type.replace('image/', '.'))
  );
};
