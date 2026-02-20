import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock axios
const mockGet = vi.fn();
vi.mock('axios', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

// Mock auth
const mockIsAuthenticated = vi.fn(() => true);
const mockGetUser = vi.fn(() => ({ _id: 'user1', seq_id: 'seq1' }));
vi.mock('@/utils/auth', () => ({
  default: {
    isAuthenticated: () => mockIsAuthenticated(),
    getUser: () => mockGetUser(),
    getToken: vi.fn(() => 'token123'),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any, fmt: string) => '2025/12/31 00:00',
}));

// Mock Skeleton component
vi.mock('@/components/Skeleton', () => ({
  default: (props: any) => <div data-testid="skeleton">Loading...</div>,
}));

// Mock EmptyState component
vi.mock('@/components/EmptyState', () => ({
  default: (props: any) => (
    <div data-testid="empty-state">
      {props.title}
      {props.description}
    </div>
  ),
}));

import AssetsPage from '@/app/ucenter/assets/page';

function setupMockGet(
  userData: Record<string, any>,
  strategies: any[] = [],
) {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/strategies')) {
      return Promise.resolve({
        data: { data: { list: strategies } },
      });
    }
    // User endpoint
    return Promise.resolve({
      data: { data: userData },
    });
  });
}

describe('AssetsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUser.mockReturnValue({ _id: 'user1', seq_id: 'seq1' });
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<AssetsPage />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders account info section after loading', async () => {
    setupMockGet(
      {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: '2025-12-31T00:00:00Z',
        XBT: '100',
        is_activated: true,
        invitation_code: 'ABC123',
      },
      [
        { _id: 's1', base_total: 1000, profit: 50, status: 1 },
        { _id: 's2', base_total: 500, profit: -10, status: 0 },
      ],
    );

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByText('assets.account_info')).toBeInTheDocument();
    });

    expect(screen.getByText('assets.email')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('assets.nickname')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('renders VIP status as active when vip_time_out_at is in the future', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    setupMockGet(
      {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: futureDate,
        XBT: '100',
        is_activated: true,
        invitation_code: 'ABC123',
      },
    );

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByText('assets.vip_active')).toBeInTheDocument();
    });
  });

  it('renders VIP status as expired when vip_time_out_at is in the past', async () => {
    setupMockGet({
      _id: 'user1',
      email: 'test@test.com',
      nick_name: 'TestUser',
      vip_time_out_at: '2020-01-01T00:00:00Z',
      XBT: '50',
      is_activated: true,
      invitation_code: 'ABC123',
    });

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByText('assets.vip_expired')).toBeInTheDocument();
    });
  });

  it('renders strategy summary with correct counts', async () => {
    setupMockGet(
      {
        _id: 'user1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vip_time_out_at: '2020-01-01T00:00:00Z',
        XBT: '100',
        is_activated: true,
        invitation_code: 'ABC123',
      },
      [
        { _id: 's1', base_total: 1000, profit: 50, status: 1 },
        { _id: 's2', base_total: 500, profit: -10, status: 0 },
        { _id: 's3', base_total: 200, profit: 30, status: 1 },
      ],
    );

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByText('assets.strategy_summary')).toBeInTheDocument();
    });

    expect(screen.getByText('assets.total_strategies')).toBeInTheDocument();
    expect(screen.getByText('assets.active_strategies')).toBeInTheDocument();
    expect(screen.getByText('assets.total_investment')).toBeInTheDocument();
    expect(screen.getByText('assets.total_profit')).toBeInTheDocument();
    // 3 strategies total
    expect(screen.getByText('3')).toBeInTheDocument();
    // 2 active strategies
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders XBT balance section', async () => {
    setupMockGet({
      _id: 'user1',
      email: 'test@test.com',
      nick_name: 'TestUser',
      vip_time_out_at: '2020-01-01T00:00:00Z',
      XBT: '250',
      is_activated: true,
      invitation_code: 'ABC123',
    });

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByText('assets.xbt_balance')).toBeInTheDocument();
    });

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('XBT')).toBeInTheDocument();
  });

  it('renders empty state when no strategies exist', async () => {
    setupMockGet({
      _id: 'user1',
      email: 'test@test.com',
      nick_name: 'TestUser',
      vip_time_out_at: '2020-01-01T00:00:00Z',
      XBT: '0',
      is_activated: true,
      invitation_code: 'ABC123',
    });

    render(<AssetsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });
});
