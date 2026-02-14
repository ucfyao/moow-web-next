import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const mockPost = vi.fn();
vi.mock('../../lib/http', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock auth
vi.mock('@/utils/auth', () => ({
  default: {
    logout: vi.fn(),
    setLocale: vi.fn(),
    getLocale: vi.fn(() => 'en'),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', { value: mockConfirm, writable: true });

describe('Navbar logout confirmation', () => {
  beforeEach(() => {
    mockUserInfo = { email: 'user@test.com' };
    mockSetUserInfo.mockClear();
    mockPost.mockReset();
    mockConfirm.mockReset();
    mockPost.mockResolvedValue({});
  });

  it('shows confirm dialog when clicking logout', () => {
    mockConfirm.mockReturnValue(false);
    render(<Header />);

    const logoutBtn = screen.getByText('sign_out');
    fireEvent.click(logoutBtn);

    expect(mockConfirm).toHaveBeenCalledWith('prompt.confirm_logout');
  });

  it('does not call logout API when user cancels', () => {
    mockConfirm.mockReturnValue(false);
    render(<Header />);

    const logoutBtn = screen.getByText('sign_out');
    fireEvent.click(logoutBtn);

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('calls logout API when user confirms', async () => {
    mockConfirm.mockReturnValue(true);
    render(<Header />);

    const logoutBtn = screen.getByText('sign_out');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });

  it('shows profile link in dropdown', () => {
    render(<Header />);
    const profileLink = screen.getByText('link.my_profile');
    expect(profileLink.closest('a')).toHaveAttribute('href', '/ucenter/profile');
  });
});
