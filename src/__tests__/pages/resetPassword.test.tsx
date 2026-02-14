import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
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
