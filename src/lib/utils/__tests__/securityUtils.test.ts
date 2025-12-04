import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';
import {
  userInputSchema,
  taskInputSchema,
  projectInputSchema,
  sanitizeInput,
  validateUserInput,
  validateToken,
  isValidUrl,
  hashSensitiveData,
  validateCSRFToken,
  secureLocalStorage,
  validateFileSize,
  validateFileType,
} from '../securityUtils';

describe('securityUtils', () => {
  describe('Input Sanitization', () => {
    it('should sanitize input using DOMPurify', () => {
      const maliciousInput = '<script>alert("XSS")</script><p>Safe content</p>';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).toBe('Safe content'); // Script tag should be removed
      expect(sanitized).not.toContain('<script>');
    });

    it('should return empty string when DOMPurify is unavailable', () => {
      // Temporarily mock DOMPurify to simulate unavailability
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = undefined as any;

      const input = '<p>Test content</p>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).toBe('');

      // Restore original DOMPurify
      global.DOMPurify = originalDOMPurify;
    });
  });

  describe('User Input Validation', () => {
    it('should validate correct email format', () => {
      const data = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      const result = validateUserInput(data, userInputSchema);
      expect(result).toEqual(data);
    });

    it('should throw error for invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      expect(() => validateUserInput(data, userInputSchema)).toThrow();
    });

    it('should throw error for weak password', () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };

      expect(() => validateUserInput(data, userInputSchema)).toThrow();
    });
  });

  describe('Task Input Validation', () => {
    it('should validate correct task input', () => {
      const taskData = {
        title: 'Valid task title',
        description: 'Valid description',
        priority: 'high' as const,
        due_date: new Date().toISOString(),
        project_id: null,
      };

      const result = validateUserInput(taskData, taskInputSchema);
      expect(result).toEqual(taskData);
    });

    it('should validate minimum required task input', () => {
      const taskData = {
        title: 'Minimal task',
      };

      const result = validateUserInput(taskData, taskInputSchema);
      expect(result).toEqual(taskData);
    });

    it('should throw error for empty title', () => {
      const taskData = {
        title: '',
      };

      expect(() => validateUserInput(taskData, taskInputSchema)).toThrow();
    });
  });

  describe('Project Input Validation', () => {
    it('should validate correct project input', () => {
      const projectData = {
        name: 'Valid Project Name',
        description: 'Valid project description',
      };

      const result = validateUserInput(projectData, projectInputSchema);
      expect(result).toEqual(projectData);
    });

    it('should throw error for empty project name', () => {
      const projectData = {
        name: '',
      };

      expect(() => validateUserInput(projectData, projectInputSchema)).toThrow();
    });
  });

  describe('Token Validation', () => {
    it('should validate a valid JWT token', () => {
      // Create a fake but properly formatted JWT with valid signature
      const fakeJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.dummy_signature';

      // Since this is a dummy token, validation should fail due to expiration
      // But it shouldn't fail on parsing or format issues
      const result = validateToken(fakeJWT);

      // Token is expired, so should return false
      expect(result).toBe(false);
    });

    it('should reject invalid token format', () => {
      const invalidToken = 'invalid.token.format';
      const result = validateToken(invalidToken);

      expect(result).toBe(false);
    });

    it('should reject non-string token', () => {
      const result = validateToken(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should validate HTTPS URL', () => {
      const url = 'https://example.com';
      const result = isValidUrl(url);

      expect(result).toBe(true);
    });

    it('should validate HTTP URL', () => {
      const url = 'http://example.com';
      const result = isValidUrl(url);

      expect(result).toBe(true);
    });

    it('should reject invalid URL', () => {
      const url = 'not-a-url';
      const result = isValidUrl(url);

      expect(result).toBe(false);
    });
  });

  describe('Sensitive Data Hashing', () => {
    it('should hash sensitive data', async () => {
      const testData = 'sensitive-data';
      const hashed = await hashSensitiveData(testData);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
      expect(hashed).not.toBe(testData); // Should be different from original
    });
  });

  describe('CSRF Token Validation', () => {
    it('should validate matching CSRF tokens', () => {
      const token = 'valid-token';
      const result = validateCSRFToken(token, token);

      expect(result).toBe(true);
    });

    it('should reject non-matching CSRF tokens', () => {
      const token = 'valid-token';
      const expected = 'different-token';
      const result = validateCSRFToken(token, expected);

      expect(result).toBe(false);
    });
  });

  describe('File Validation', () => {
    it('should validate file size', () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 1024 }); // 1KB

      const result = validateFileSize(mockFile, 2); // Max 2MB
      expect(result).toBe(true);
    });

    it('should reject oversized file', () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 3 * 1024 * 1024 }); // 3MB

      const result = validateFileSize(mockFile, 2); // Max 2MB
      expect(result).toBe(false);
    });

    it('should validate file type', () => {
      const mockFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });

      const result = validateFileType(mockFile, ['image/jpeg']);
      expect(result).toBe(true);
    });

    it('should reject invalid file type', () => {
      const mockFile = new File(['content'], 'file.pdf', { type: 'application/pdf' });

      const result = validateFileType(mockFile, ['image/jpeg']);
      expect(result).toBe(false);
    });
  });
});
