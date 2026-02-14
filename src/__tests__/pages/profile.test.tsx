import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockPost = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock auth
const mockIsAuthenticated = vi.fn(() => true);
const mockGetUser = vi.fn(() => ({ _id: 'user1', email: 'test@test.com' }));
vi.mock('@/utils/auth', () => ({
  default: {
    isAuthenticated: () => mockIsAuthenticated(),
    getUser: () => mockGetUser(),
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

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any, fmt: string) => '2025/12/31',
}));

import ProfilePage from '@/app/ucenter/profile/page';

describe('ProfilePage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockPost.mockReset();
    mockSetUserInfo.mockClear();
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUser.mockReturnValue({ _id: 'user1', email: 'test@test.com' });
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ProfilePage />);
    expect(screen.getByText('prompt.loading')).toBeInTheDocument();
  });

  it('renders profile form after loading', async () => {
    mockGet.mockResolvedValue({
      data: {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: '2025-12-31T00:00:00Z',
        is_activated: true,
      },
    });

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('profile.page_title')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument();
    expect(screen.getByText('profile.save')).toBeInTheDocument();
    expect(screen.getByText('profile.change_password')).toBeInTheDocument();
    expect(screen.getByText('profile.logout')).toBeInTheDocument();
  });

  it('renders change password link pointing to correct URL', async () => {
    mockGet.mockResolvedValue({
      data: {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: null,
        is_activated: true,
      },
    });

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('profile.change_password')).toBeInTheDocument();
    });

    const changePasswordLink = screen.getByText('profile.change_password');
    expect(changePasswordLink.closest('a')).toHaveAttribute('href', '/ucenter/changePassword');
  });

  it('allows editing the nickname field', async () => {
    mockGet.mockResolvedValue({
      data: {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'OldNick',
        vip_time_out_at: null,
        is_activated: true,
      },
    });

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('OldNick')).toBeInTheDocument();
    });

    const nicknameInput = screen.getByDisplayValue('OldNick');
    fireEvent.change(nicknameInput, { target: { value: 'NewNick' } });
    expect(nicknameInput).toHaveValue('NewNick');
  });

  it('calls save API when save button clicked', async () => {
    mockGet.mockResolvedValue({
      data: {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: null,
        is_activated: true,
      },
    });
    mockPatch.mockResolvedValue({});

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('profile.save')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('profile.save'));
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/v1/users/user1', { nick_name: 'TestUser' });
    });
  });
});
