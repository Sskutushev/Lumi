import { sanitizeInput } from '../securityUtils';

describe('securityUtils', () => {
  describe('sanitizeInput', () => {
    test('should remove script tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    test('should remove iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe>';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    test('should remove javascript protocol', () => {
      const input = 'javascript:alert(1)';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    test('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('<div>Click me</div>');
    });

    test('should handle basic text safely', () => {
      const input = 'Hello, world!';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello, world!');
    });

    test('should remove multiple types of malicious content', () => {
      const input = '<script>alert(1)</script><iframe></iframe><div onclick="xss()">test</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('<div>test</div>');
    });

    test('should handle empty string', () => {
      const input = '';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    test('should handle null characters', () => {
      const input = 'test\x00script';
      const result = sanitizeInput(input);
      expect(result).toBe('testscript');
    });
  });
});
