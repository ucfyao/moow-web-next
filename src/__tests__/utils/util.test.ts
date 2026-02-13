import { describe, it, expect } from 'vitest';
import util from '@/utils/util';

describe('util', () => {
  describe('formatNumber', () => {
    it('formats number with default 6 decimal places', () => {
      expect(util.formatNumber(3.14159265)).toBe('3.141593');
    });

    it('formats number with custom decimal places', () => {
      expect(util.formatNumber(3.14159, 2)).toBe('3.14');
    });

    it('appends unit when provided', () => {
      expect(util.formatNumber(100, 2, '%')).toBe('100.00%');
    });

    it('returns "-" for NaN', () => {
      expect(util.formatNumber(NaN)).toBe('-');
    });
  });

  describe('readableNumber', () => {
    it('formats small numbers with 2 decimal places', () => {
      expect(util.readableNumber(1234.5)).toBe('1234.50');
    });

    it('formats numbers > 100k in 万', () => {
      expect(util.readableNumber(150000)).toBe('15.00万');
    });

    it('formats numbers > 1B in 亿', () => {
      expect(util.readableNumber(1500000000)).toBe('15.00亿');
    });

    it('handles zero', () => {
      expect(util.readableNumber(0)).toBe('0.00');
    });
  });

  describe('formatDate', () => {
    it('formats date with default format', () => {
      const date = new Date('2024-06-15T10:30:00');
      const result = util.formatDate(date);
      expect(result).toContain('2024-06-15');
      expect(result).toContain('10:30:00');
    });

    it('formats date with custom format', () => {
      const result = util.formatDate('2024-06-15', 'yyyy/MM/dd');
      expect(result).toBe('2024/06/15');
    });

    it('returns empty string for falsy date', () => {
      expect(util.formatDate('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('returns string representation of number', () => {
      expect(util.formatCurrency(1234.56)).toBe('1234.56');
    });

    it('returns "-" for NaN', () => {
      expect(util.formatCurrency(NaN)).toBe('-');
    });
  });

  describe('desensitization', () => {
    it('masks phone numbers', () => {
      const [masked] = util.desensitization('13812345678');
      expect(masked).toBe('138****5678');
    });

    it('masks email addresses', () => {
      const [masked] = util.desensitization('test@example.com');
      expect(masked).toBe('te****@example.com');
    });

    it('masks ID card numbers (18 digits)', () => {
      const [masked] = util.desensitization('110101199001011234');
      expect(masked).toBe('110****1234');
    });

    it('masks bank card numbers (16 digits)', () => {
      const [masked] = util.desensitization('6222021234561234');
      expect(masked).toBe('****1234');
    });

    it('returns original string for unrecognized patterns', () => {
      const [masked] = util.desensitization('hello');
      expect(masked).toBe('hello');
    });

    it('handles multiple arguments', () => {
      const results = util.desensitization('13812345678', 'test@example.com');
      expect(results).toHaveLength(2);
      expect(results[0]).toBe('138****5678');
      expect(results[1]).toBe('te****@example.com');
    });
  });
});
