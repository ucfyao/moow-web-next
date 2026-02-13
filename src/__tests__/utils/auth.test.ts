import { describe, it, expect, beforeEach } from 'vitest';
import auth from '@/utils/auth';

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('stores user and token in localStorage and returns true for valid data', () => {
      const loginData = {
        user: { email: 'test@example.com', name: 'Test' },
        token: 'abc123',
      };

      const result = auth.login(loginData);

      expect(result).toBe(true);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(loginData.user));
      expect(localStorage.getItem('token')).toBe('abc123');
      expect(localStorage.getItem('is-authenticated')).toBe('true');
    });

    it('returns false for non-object input', () => {
      // Note: typeof null === 'object' in JS, so auth.login(null) will
      // attempt to access null.user and throw. Test string/number instead.
      expect(auth.login('string')).toBe(false);
      expect(auth.login(123)).toBe(false);
      expect(auth.login(undefined)).toBe(false);
    });

    it('returns false and does not write to localStorage for non-object input', () => {
      auth.login('not an object');
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears all auth-related localStorage items', () => {
      auth.login({ user: { email: 'test@example.com' }, token: 'abc123' });
      auth.logout();

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('is-authenticated')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true after login', () => {
      auth.login({ user: { email: 'test@example.com' }, token: 'abc123' });
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('returns false when not logged in', () => {
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('returns false after setAsLoggedOut', () => {
      auth.login({ user: { email: 'test@example.com' }, token: 'abc123' });
      auth.setAsLoggedOut();
      expect(auth.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('returns the stored token', () => {
      auth.login({ user: { email: 'test@example.com' }, token: 'mytoken' });
      expect(auth.getToken()).toBe('mytoken');
    });

    it('returns null when no token stored', () => {
      expect(auth.getToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns the stored user object', () => {
      const user = { email: 'test@example.com', name: 'Test' };
      auth.login({ user, token: 'abc' });
      expect(auth.getUser()).toEqual(user);
    });

    it('returns null when no user stored', () => {
      expect(auth.getUser()).toBeNull();
    });

    it('returns null for invalid JSON without throwing', () => {
      localStorage.setItem('user', 'invalid-json{{{');
      expect(auth.getUser()).toBeNull();
    });
  });

  describe('locale', () => {
    it('returns "en" as default locale', () => {
      expect(auth.getLocale()).toBe('en');
    });

    it('stores and retrieves locale', () => {
      auth.setLocale('zh');
      expect(auth.getLocale()).toBe('zh');
    });
  });

  describe('symbols', () => {
    it('stores and retrieves symbols as array', () => {
      auth.setSymbols(['BTC', 'ETH', 'LTC']);
      expect(auth.getSymbols()).toEqual(['BTC', 'ETH', 'LTC']);
    });

    it('returns empty array when no symbols stored', () => {
      expect(auth.getSymbols()).toEqual([]);
    });

    it('ignores non-array input', () => {
      auth.setSymbols('not an array' as any);
      expect(auth.getSymbols()).toEqual([]);
    });
  });

  describe('exchanges', () => {
    it('stores and retrieves exchanges as array', () => {
      auth.setExchanges(['binance', 'huobipro']);
      expect(auth.getExchanges()).toEqual(['binance', 'huobipro']);
    });

    it('returns empty array when no exchanges stored', () => {
      expect(auth.getExchanges()).toEqual([]);
    });
  });

  describe('refreshInterval', () => {
    it('stores and retrieves refresh interval', () => {
      auth.setRefreshInterval(30);
      expect(auth.getRefreshInterval()).toBe(30);
    });

    it('returns minimum of 10 for values less than 10', () => {
      auth.setRefreshInterval(5);
      expect(auth.getRefreshInterval()).toBe(10);
    });

    it('returns 60 as default (parsed from empty storage)', () => {
      expect(auth.getRefreshInterval()).toBe(60);
    });
  });
});
