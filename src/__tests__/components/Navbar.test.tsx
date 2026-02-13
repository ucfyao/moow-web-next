import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Navbar';

// Mock the user store
const mockSetUserInfo = vi.fn();
let mockUserInfo: any = null;

vi.mock('@/store/user', () => ({
  default: (selector: any) => {
    const state = {
      userInfo: mockUserInfo,
      setUserInfo: mockSetUserInfo,
    };
    return selector(state);
  },
}));

// Mock HTTP module
vi.mock('../../lib/http', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

describe('Navbar (Header)', () => {
  beforeEach(() => {
    mockUserInfo = null;
    mockSetUserInfo.mockClear();
  });

  it('shows sign in/sign up button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText(/sign_in/)).toBeInTheDocument();
  });

  it('shows user email when authenticated', () => {
    mockUserInfo = { email: 'user@example.com' };
    render(<Header />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('link.home')).toBeInTheDocument();
    expect(screen.getByText('link.coin_aip')).toBeInTheDocument();
  });

  it('toggles mobile menu on burger click', () => {
    const { container } = render(<Header />);
    const burger = container.querySelector('.navbar-burger');

    expect(burger).not.toHaveClass('is-active');
    fireEvent.click(burger!);
    expect(burger).toHaveClass('is-active');
  });

  it('shows language switch button', () => {
    render(<Header />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});
