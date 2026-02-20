import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock useParams to provide strategyId
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: () => ({ strategyId: 'test-strategy-123' }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/aip/test-strategy-123',
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock util
vi.mock('@/utils/util', () => ({
  default: {
    formatDate: (date: string) => '2024-01-15 10:30',
    formatNumber: (value: number, mantissa?: number, unit?: string) => {
      if (isNaN(value)) return '-';
      return Number(value).toFixed(mantissa ?? 6) + (unit || '');
    },
  },
}));

// Mock Highcharts
vi.mock('highcharts', () => ({
  default: {
    chart: vi.fn(() => ({ destroy: vi.fn(), reflow: vi.fn() })),
    getOptions: () => ({ colors: ['#7cb5ec', '#434348', '#90ed7d'] }),
  },
}));

import StrategyDetails from '@/app/aip/[strategyId]/page';

const mockDetailResponse = {
  data: {
    info: {
      _id: 'test-strategy-123',
      created_at: '2024-01-15T10:30:00Z',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      quote: 'BTC',
      quote_total: 0.05,
      price_native: '42000',
      price_total: 0,
      base: 'USDT',
      base_limit: 100,
      base_total: 1000,
      profit: 0,
      profit_percentage: 0,
      stop_profit_percentage: 10,
      price_usd: '42000',
      status: 1,
    },
    symbolPrice: {
      price_usd: '42000',
    },
  },
};

const mockOrdersResponse = {
  data: {
    list: [
      {
        _id: 'o1',
        created_at: '2024-01-15T10:30:00Z',
        symbol: 'BTC/USDT',
        side: 'buy',
        price: '42000',
        amount: '0.001',
        funds: '42',
        record_amount: '0.001',
        avg_price: '42000',
        base_total: 1000,
        value_total: 1050,
        cost: '42',
      },
      {
        _id: 'o2',
        created_at: '2024-01-16T10:30:00Z',
        symbol: 'BTC/USDT',
        side: 'sell',
        price: '43000',
        amount: '0.0005',
        funds: '21.5',
        record_amount: '0.0005',
        avg_price: '43000',
        base_total: 950,
        value_total: 1020,
        cost: '21.5',
      },
    ],
  },
};

describe('StrategyDetails Page', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it('renders loading skeleton initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<StrategyDetails />);
    expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
  });

  it('fetches strategy detail and orders on mount', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/strategies/test-strategy-123');
      expect(mockGet).toHaveBeenCalledWith('/v1/orders', {
        params: { strategy_id: 'test-strategy-123' },
      });
    });
  });

  it('displays strategy details after loading', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('caption.investment_details')).toBeInTheDocument();
    });
  });

  it('renders action buttons (edit, manual buy, manual sell)', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('strategy.manual_buy')).toBeInTheDocument();
      expect(screen.getByText('strategy.manual_sell')).toBeInTheDocument();
      expect(screen.getByText('action.edit')).toBeInTheDocument();
    });
  });

  it('renders strategy status with running badge', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText(/strategy\.status_running/)).toBeInTheDocument();
    });
  });

  it('renders order table with order data', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('caption.investment_orders')).toBeInTheDocument();
      expect(screen.getByText('title.commission_time')).toBeInTheDocument();
      expect(screen.getByText('title.symbol')).toBeInTheDocument();
      expect(screen.getByText('order.side')).toBeInTheDocument();
    });
  });

  it('renders order statistics when orders exist', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('order.total_orders')).toBeInTheDocument();
      expect(screen.getByText('order.buy_orders')).toBeInTheDocument();
      expect(screen.getByText('order.sell_orders')).toBeInTheDocument();
    });
  });

  it('renders go back link', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('action.go_back')).toBeInTheDocument();
      const link = screen.getByText('action.go_back').closest('a');
      expect(link).toHaveAttribute('href', '/aip');
    });
  });

  it('opens confirm modal when manual buy is clicked', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('strategy.manual_buy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('strategy.manual_buy'));
    await waitFor(() => {
      expect(screen.getByText('strategy.confirm_manual_buy')).toBeInTheDocument();
    });
  });

  it('shows no record image when no orders', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve({ data: { list: [] } });
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      const img = screen.getByAltText('No records found');
      expect(img).toBeInTheDocument();
    });
  });

  it('renders chart time range controls when orders exist', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/v1/strategies/')) return Promise.resolve(mockDetailResponse);
      if (url.includes('/v1/orders')) return Promise.resolve(mockOrdersResponse);
      return Promise.resolve({ data: {} });
    });

    render(<StrategyDetails />);
    await waitFor(() => {
      expect(screen.getByText('chart.all')).toBeInTheDocument();
    });
  });
});
