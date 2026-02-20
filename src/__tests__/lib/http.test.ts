import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use vi.hoisted() so these are available inside the hoisted vi.mock() factory
const {
  captured,
  mockCancelFn,
  mockCancelTokenSource,
} = vi.hoisted(() => {
  const captured: {
    requestFulfilled: ((config: any) => any) | null;
    requestRejected: ((error: any) => any) | null;
    responseFulfilled: ((response: any) => any) | null;
    responseRejected: ((error: any) => any) | null;
    createConfig: any;
  } = {
    requestFulfilled: null,
    requestRejected: null,
    responseFulfilled: null,
    responseRejected: null,
    createConfig: null,
  };

  const mockCancelFn = vi.fn();
  const mockCancelTokenSource = {
    token: 'mock-cancel-token',
    cancel: mockCancelFn,
  };

  return { captured, mockCancelFn, mockCancelTokenSource };
});

vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: {
        use: vi.fn((fulfilled: any, rejected: any) => {
          captured.requestFulfilled = fulfilled;
          captured.requestRejected = rejected;
        }),
      },
      response: {
        use: vi.fn((fulfilled: any, rejected: any) => {
          captured.responseFulfilled = fulfilled;
          captured.responseRejected = rejected;
        }),
      },
    },
    defaults: {},
  };

  return {
    default: {
      create: vi.fn((config: any) => {
        captured.createConfig = config;
        return mockInstance;
      }),
      CancelToken: {
        source: () => mockCancelTokenSource,
      },
    },
  };
});

// Import the module — triggers axios.create() and interceptor registration
import service from '@/lib/http';

describe('http client', () => {
  beforeEach(() => {
    localStorage.clear();
    mockCancelFn.mockClear();
    // Reset location.href to default
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
      configurable: true,
    });
  });

  describe('exports and configuration', () => {
    it('exports the axios instance as default', () => {
      expect(service).toBeDefined();
    });

    it('creates axios with baseURL defaulting to /api', () => {
      expect(captured.createConfig).toBeDefined();
      expect(captured.createConfig.baseURL).toBe('/api');
    });

    it('configures 60 second timeout', () => {
      expect(captured.createConfig.timeout).toBe(60 * 1000);
    });

    it('configures CSRF cookie and header names', () => {
      expect(captured.createConfig.xsrfCookieName).toBe('csrfToken');
      expect(captured.createConfig.xsrfHeaderName).toBe('x-csrf-token');
    });

    it('provides a custom transformResponse array', () => {
      expect(captured.createConfig.transformResponse).toBeDefined();
      expect(Array.isArray(captured.createConfig.transformResponse)).toBe(true);
      expect(captured.createConfig.transformResponse).toHaveLength(1);
    });
  });

  describe('json-bigint transformResponse', () => {
    const transform = () => captured.createConfig.transformResponse[0];

    it('correctly parses a valid JSON string', () => {
      const result = transform()('{"name":"test","value":42}');
      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('preserves big number precision by storing as string', () => {
      // 9007199254740993 is beyond Number.MAX_SAFE_INTEGER (9007199254740991)
      const result = transform()('{"id": 9007199254740993}');
      expect(result.id).toBe('9007199254740993');
    });

    it('handles non-string data by returning as-is', () => {
      const obj = { already: 'parsed' };
      expect(transform()(obj)).toBe(obj);

      expect(transform()(123)).toBe(123);
      expect(transform()(null)).toBeNull();
      expect(transform()(undefined)).toBeUndefined();
    });

    it('returns the original string when JSON is invalid', () => {
      const invalid = 'this is not json{{{';
      expect(transform()(invalid)).toBe(invalid);
    });

    it('handles empty string by returning as-is (invalid JSON)', () => {
      const result = transform()('');
      expect(result).toBe('');
    });
  });

  describe('request interceptor — token attachment', () => {
    it('attaches Authorization header when token exists in localStorage', () => {
      localStorage.setItem('token', 'my-test-token');

      const config = {
        url: '/some-endpoint',
        headers: {},
        method: 'get',
        timeout: 0,
      };

      const result = captured.requestFulfilled!(config);
      expect(result.headers.Authorization).toBe('my-test-token');
    });

    it('does not attach Authorization header when no token in localStorage', () => {
      const config = {
        url: '/some-endpoint',
        headers: {},
        method: 'get',
        timeout: 0,
      };

      const result = captured.requestFulfilled!(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('does not modify headers when headers or method are missing', () => {
      const config = {
        url: '/some-endpoint',
        timeout: 0,
      };

      const result = captured.requestFulfilled!(config);
      expect(result).toEqual(config);
    });
  });

  describe('request interceptor — timeout', () => {
    it('returns config as-is when timeout is 0', () => {
      const config = {
        url: '/test',
        headers: {},
        method: 'get',
        timeout: 0,
      };

      const result = captured.requestFulfilled!(config);
      // Should not have cancelToken added
      expect(result.cancelToken).toBeUndefined();
    });

    it('returns config as-is when timeout is undefined', () => {
      const config = {
        url: '/test',
        headers: {},
        method: 'get',
        timeout: undefined,
      };

      const result = captured.requestFulfilled!(config);
      expect(result.cancelToken).toBeUndefined();
    });

    it('creates cancel token when timeout is set', () => {
      const config = {
        url: '/test',
        headers: {},
        method: 'get',
        timeout: 5000,
      };

      const result = captured.requestFulfilled!(config);
      expect(result.cancelToken).toBe('mock-cancel-token');
    });

    it('preserves existing cancelToken behavior when present', () => {
      let resolvePromise: (value: any) => void;
      const cancelTokenPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const config = {
        url: '/test',
        headers: {},
        method: 'get',
        timeout: 5000,
        cancelToken: {
          promise: cancelTokenPromise,
        },
      };

      const result = captured.requestFulfilled!(config);
      expect(result.cancelToken).toBe('mock-cancel-token');

      // Trigger the original cancel token's promise
      resolvePromise!({ message: 'user cancelled' });
      return cancelTokenPromise.then(() => {
        expect(mockCancelFn).toHaveBeenCalledWith('user cancelled');
      });
    });
  });

  describe('request interceptor — error handler', () => {
    it('rejects with the error', async () => {
      const error = new Error('request setup failed');
      await expect(captured.requestRejected!(error)).rejects.toThrow('request setup failed');
    });
  });

  describe('response interceptor — success', () => {
    it('returns response data when status is 0', () => {
      const response = {
        data: { status: 0, data: { items: [1, 2, 3] } },
      };

      const result = captured.responseFulfilled!(response);
      expect(result).toEqual({ status: 0, data: { items: [1, 2, 3] } });
    });
  });

  describe('response interceptor — error codes', () => {
    it('rejects promise for non-zero status', async () => {
      const response = {
        data: { status: 10001, message: 'some error' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 10001,
        message: 'some error',
      });
    });

    it('rejects for token error status 40001', async () => {
      const response = {
        data: { status: 40001, message: 'invalid token' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 40001,
        message: 'invalid token',
      });
    });

    it('rejects for token error status 40002', async () => {
      const response = {
        data: { status: 40002, message: 'token expired' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 40002,
        message: 'token expired',
      });
    });

    it('rejects for token error status 40003', async () => {
      const response = {
        data: { status: 40003, message: 'logged in from another client' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 40003,
        message: 'logged in from another client',
      });
    });

    it('redirects to /activate for status 40005', async () => {
      const response = {
        data: { status: 40005, message: 'not activated' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 40005,
        message: 'not activated',
      });
      expect(window.location.href).toBe('/activate');
    });

    it('redirects to /purchase for status 40008', async () => {
      const response = {
        data: { status: 40008, message: 'not VIP' },
      };

      await expect(captured.responseFulfilled!(response)).rejects.toEqual({
        status: 40008,
        message: 'not VIP',
      });
      expect(window.location.href).toBe('/purchase');
    });
  });

  describe('response interceptor — error handler', () => {
    it('rejects with the error', async () => {
      const error = new Error('network error');
      await expect(captured.responseRejected!(error)).rejects.toThrow('network error');
    });
  });
});
