import { sanitizeInput } from '../securityUtils';
import { describe, it, expect } from 'vitest';

describe('securityUtils', () => {
  describe('sanitizeInput with DOMPurify', () => {
    it('should remove script tags and their content', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    it('should remove iframe tags', () => {
      const input = 'This is an <iframe src="malicious.com"></iframe>';
      expect(sanitizeInput(input)).toBe('This is an');
    });

    it('should strip javascript protocol from links', () => {
      const input = '<a href="javascript:alert(1)">Click Me</a>';
      expect(sanitizeInput(input)).toBe('Click Me');
    });

    it('should remove event handlers like onclick', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeInput(input)).toBe('Click me');
    });

    it('should handle plain text without changes', () => {
      const input = 'Hello, this is a clean world!';
      expect(sanitizeInput(input)).toBe('Hello, this is a clean world!');
    });

    it('should remove a mix of malicious tags', () => {
      const input =
        '<p>Test</p><script>alert(1)</script><iframe></iframe><b onmouseover="xss()">test</b>';
      expect(sanitizeInput(input)).toBe('Test test');
    });

    it('should handle an empty string', () => {
      const input = '';
      expect(sanitizeInput(input)).toBe('');
    });

    it('should handle a string with only whitespace', () => {
      const input = '   ';
      expect(sanitizeInput(input)).toBe('');
    });

    it('should remove null characters', () => {
      const input = 'test\x00script';
      // DOMPurify removes null characters by default
      expect(sanitizeInput(input)).toBe('testscript');
    });

    it('should keep text content from within tags', () => {
      const input = '<b>Bold text</b> and <i>italic text</i>';
      expect(sanitizeInput(input)).toBe('Bold text and italic text');
    });

    it('should handle nested malicious tags', () => {
      const input = '<div onclick="xss()"><p><script>alert("nested")</script></p></div>';
      expect(sanitizeInput(input)).toBe('');
    });

    it('should prevent XSS via image onload attribute', () => {
      const input = '<img src="x" onerror="alert(1)">';
      expect(sanitizeInput(input)).toBe('');
    });
  });
});
