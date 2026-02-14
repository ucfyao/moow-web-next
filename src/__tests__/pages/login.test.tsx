import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock axios
const mockPost = vi.fn();
const mockGet = vi.fn();
vi.mock('axios', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
  },
}));

// Mock auth
vi.mock('@/utils/auth', () => ({
  default: {
    login: vi.fn(() => false),
    getUser: vi.fn(),
    getLocale: vi.fn(() => 'en'),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
}));

// Mock user store
vi.mock('@/store/user', () => ({
  default: () => ({ setUserInfo: vi.fn() }),
}));

import LoginPage from '@/app/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockGet.mockResolvedValue({ data: '<svg></svg>' });
  });

  it('renders login form with i18n keys', () => {
    render(<LoginPage />);
    // sign_in appears in both card header and button
    expect(screen.getAllByText('sign_in').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText('placeholder.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.captcha')).toBeInTheDocument();
  });

  it('renders sign up link with i18n', () => {
    render(<LoginPage />);
    expect(screen.getByText('have_not_registered')).toBeInTheDocument();
    expect(screen.getByText('sign_up_now')).toBeInTheDocument();
  });

  it('renders forget password link with i18n', () => {
    render(<LoginPage />);
    expect(screen.getByText('forget_password')).toBeInTheDocument();
  });

  it('renders feature section with i18n keys', () => {
    render(<LoginPage />);
    expect(screen.getByText('feature.multiple_strategies')).toBeInTheDocument();
    expect(screen.getByText('feature.risk_control')).toBeInTheDocument();
    expect(screen.getByText('feature.transparent')).toBeInTheDocument();
    expect(screen.getByText('feature.open_data')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('placeholder.email');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');
  });
});
