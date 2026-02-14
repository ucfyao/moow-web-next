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

import ForgetPassword from '@/app/forgetPassword/page';

describe('ForgetPassword', () => {
  it('renders form with i18n keys', () => {
    render(<ForgetPassword />);
    expect(screen.getByText('caption.retrieve_password')).toBeInTheDocument();
    expect(screen.getByText('label.retrieve_password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.captcha')).toBeInTheDocument();
    expect(screen.getByText('action.confirm')).toBeInTheDocument();
  });
});
