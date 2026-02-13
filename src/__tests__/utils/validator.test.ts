import { describe, it, expect } from 'vitest';
import { validate, getInvalidFields } from '@/utils/validator';

describe('validator', () => {
  const rules = {
    email: [
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
    ],
    password: [
      { required: true, message: 'Password is required' },
      { type: 'string', min: 6, max: 32, message: 'Password must be 6-32 characters' },
    ],
  };

  describe('validate', () => {
    it('returns errors for empty required fields', async () => {
      const data = { email: '', password: '' };
      const result = await validate(data, rules);

      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('returns false for valid data', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = await validate(data, rules);

      expect(result).toBe(false);
    });

    it('returns errors for invalid email format', async () => {
      const data = { email: 'not-an-email', password: 'password123' };
      const result = await validate(data, rules);

      expect(result).toBeTruthy();
      expect(result.some((e: any) => e.field === 'email')).toBe(true);
    });

    it('returns errors for short password', async () => {
      const data = { email: 'test@example.com', password: '123' };
      const result = await validate(data, rules);

      expect(result).toBeTruthy();
      expect(result.some((e: any) => e.field === 'password')).toBe(true);
    });

    it('returns undefined for null data', async () => {
      const result = await validate(null, rules);
      expect(result).toBeUndefined();
    });

    it('returns undefined for null rules', async () => {
      const result = await validate({ email: '' }, null);
      expect(result).toBeUndefined();
    });
  });

  describe('getInvalidFields', () => {
    it('returns object with field:message pairs for invalid data', async () => {
      const data = { email: '', password: '' };
      const result = await getInvalidFields(data, rules);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
      expect(result.email).toBeDefined();
      expect(result.password).toBeDefined();
    });

    it('returns false for valid data', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = await getInvalidFields(data, rules);

      expect(result).toBe(false);
    });
  });
});
