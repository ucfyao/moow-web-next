import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock HTTP client
vi.mock('@/lib/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
  validateField: vi.fn(() => Promise.resolve(null)),
}));

import ResetPasswordPage from '@/app/resetPassword/page';

describe('ResetPasswordPage', () => {
  it('renders form with i18n keys', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText('caption.reset_password')).toBeInTheDocument();
    // Labels contain multiple text nodes (*, label.input, label.new_password)
    expect(screen.getByText('label.new_password', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('label.confirm_password', { exact: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.repeat_password')).toBeInTheDocument();
    expect(screen.getByText('action.confirm')).toBeInTheDocument();
  });
});
