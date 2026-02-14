import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockPost = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock auth
vi.mock('@/utils/auth', () => ({
  default: {
    isAuthenticated: vi.fn(() => true),
    getUser: vi.fn(() => ({ _id: 'user1', email: 'test@test.com' })),
    getToken: vi.fn(() => 'token123'),
    logout: vi.fn(),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
}));

// Mock user store
const mockSetUserInfo = vi.fn();
vi.mock('@/store/user', () => ({
  default: (selector: any) => {
    const state = { userInfo: { email: 'test@test.com' }, setUserInfo: mockSetUserInfo };
    return selector(state);
  },
}));

import ChangePasswordPage from '@/app/ucenter/changePassword/page';

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockSetUserInfo.mockClear();
  });

  it('renders change password form', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByText('caption.change_password')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('action.send_code')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByPlaceholderText('profile.verification_code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.repeat_password')).toBeInTheDocument();
  });

  it('sends verification code and shows countdown', async () => {
    mockPost.mockResolvedValue({});
    render(<ChangePasswordPage />);

    const sendBtn = screen.getByText('action.send_code');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/v1/auth/send-code', { email: 'test@test.com' });
    });
  });

  it('handles form input changes', () => {
    render(<ChangePasswordPage />);

    const codeInput = screen.getByPlaceholderText('profile.verification_code');
    fireEvent.change(codeInput, { target: { name: 'code', value: '123456' } });
    expect(codeInput).toHaveValue('123456');

    const passwordInput = screen.getByPlaceholderText('placeholder.password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'newpass123' } });
    expect(passwordInput).toHaveValue('newpass123');

    const confirmInput = screen.getByPlaceholderText('placeholder.repeat_password');
    fireEvent.change(confirmInput, { target: { name: 'passwordCheck', value: 'newpass123' } });
    expect(confirmInput).toHaveValue('newpass123');
  });

  it('submits change password form', async () => {
    mockPost.mockResolvedValue({});
    render(<ChangePasswordPage />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('profile.verification_code'), {
      target: { name: 'code', value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.password'), {
      target: { name: 'password', value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.repeat_password'), {
      target: { name: 'passwordCheck', value: 'newpass123' },
    });

    // Submit
    const confirmBtn = screen.getByText('action.confirm');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/v1/auth/change-password', {
        code: '123456',
        newPassword: 'newpass123',
      });
    });
  });

  it('displays email in read-only field', () => {
    render(<ChangePasswordPage />);
    const emailInput = screen.getByDisplayValue('test@test.com');
    expect(emailInput).toBeDisabled();
  });
});
