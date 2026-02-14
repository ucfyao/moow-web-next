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
    getLocale: vi.fn(() => 'en'),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
}));

import SignUp from '@/app/signup/page';

describe('SignUp', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockGet.mockResolvedValue({ data: '<svg></svg>' });
  });

  it('renders signup form with i18n keys', () => {
    render(<SignUp />);
    expect(screen.getAllByText('sign_up').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('placeholder.name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.repeat_password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.invitation_code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.captcha')).toBeInTheDocument();
  });

  it('renders sign in link with i18n', () => {
    render(<SignUp />);
    expect(screen.getByText('have_registered')).toBeInTheDocument();
    expect(screen.getByText('sign_in')).toBeInTheDocument();
  });

  it('renders feature section with i18n keys', () => {
    render(<SignUp />);
    expect(screen.getByText('feature.multiple_strategies')).toBeInTheDocument();
    expect(screen.getByText('feature.risk_control')).toBeInTheDocument();
    expect(screen.getByText('feature.transparent')).toBeInTheDocument();
    expect(screen.getByText('feature.open_data')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<SignUp />);
    const emailInput = screen.getByPlaceholderText('placeholder.email');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');
  });
});
