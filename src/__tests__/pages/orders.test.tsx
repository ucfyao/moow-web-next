import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

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

import OrderHistory from '@/app/aip/orders/page';

const mockStrategiesResponse = {
  data: {
    list: [
      { _id: 's1', exchange: 'binance', symbol: 'BTC/USDT' },
      { _id: 's2', exchange: 'huobi', symbol: 'ETH/USDT' },
    ],
  },
};

const mockStatisticsResponse = {
  data: {
    total_orders: 42,
    buy_count: 30,
    sell_count: 12,
    total_buy_cost: 5000,
    total_sell_revenue: 3000,
    total_profit: 800,
  },
};

const mockOrdersResponse = {
  data: {
    list: [
      {
        _id: 'o1',
        strategy_id: 's1',
        created_at: '2024-01-15T10:30:00Z',
        symbol: 'BTC/USDT',
        side: 'buy',
        price: '42000.00',
        amount: '0.001',
        funds: '42',
        record_amount: '0.001',
        avg_price: '42000',
        cost: '42',
        base_total: 1000,
        value_total: 1050,
        profit: 50,
        profit_percentage: 5,
      },
      {
        _id: 'o2',
        strategy_id: 's1',
        created_at: '2024-01-16T10:30:00Z',
        symbol: 'BTC/USDT',
        side: 'sell',
        price: '43000.00',
        amount: '0.0005',
        funds: '21.5',
        record_amount: '0.0005',
        avg_price: '43000',
        cost: '21.5',
        base_total: 950,
        value_total: 1020,
        profit: -30,
        profit_percentage: -2.5,
      },
    ],
  },
};

function setupDefaultMocks() {
  mockGet.mockImplementation((url: string) => {
    if (url === '/v1/strategies') return Promise.resolve(mockStrategiesResponse);
    if (url === '/v1/orders/statistics') return Promise.resolve(mockStatisticsResponse);
    if (url === '/v1/orders') return Promise.resolve(mockOrdersResponse);
    return Promise.resolve({ data: {} });
  });
}

describe('OrderHistory Page', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('renders loading skeleton initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<OrderHistory />);
    expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
  });

  it('renders page heading after loading', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('orders.page_title')).toBeInTheDocument();
    });
  });

  it('fetches orders on mount', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/orders', { params: {} });
    });
  });

  it('fetches strategies for filter dropdown', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/strategies', {
        params: { pageNumber: 1, pageSize: 999 },
      });
    });
  });

  it('fetches order statistics', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/orders/statistics');
    });
  });

  it('displays order items in the table', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      // order.buy appears in both filter dropdown and table; check at least 2 exist
      const buyTexts = screen.getAllByText('order.buy');
      expect(buyTexts.length).toBeGreaterThanOrEqual(2);
      const sellTexts = screen.getAllByText('order.sell');
      expect(sellTexts.length).toBeGreaterThanOrEqual(2);
      // Check order prices
      expect(screen.getByText('42000.00')).toBeInTheDocument();
      expect(screen.getByText('43000.00')).toBeInTheDocument();
    });
  });

  it('renders table headers', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('title.commission_time')).toBeInTheDocument();
      expect(screen.getByText('title.symbol')).toBeInTheDocument();
      expect(screen.getByText('order.side')).toBeInTheDocument();
      expect(screen.getByText('title.commission_price')).toBeInTheDocument();
      expect(screen.getByText('title.profit')).toBeInTheDocument();
      expect(screen.getByText('title.profit_percentage')).toBeInTheDocument();
    });
  });

  it('shows empty state when no orders', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/v1/strategies') return Promise.resolve(mockStrategiesResponse);
      if (url === '/v1/orders/statistics') return Promise.resolve(mockStatisticsResponse);
      if (url === '/v1/orders') return Promise.resolve({ data: { list: [] } });
      return Promise.resolve({ data: {} });
    });

    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('empty.no_orders')).toBeInTheDocument();
      expect(screen.getByText('empty.orders_will_appear')).toBeInTheDocument();
    });
  });

  it('renders filter controls (strategy and side selects)', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('orders.all_strategies')).toBeInTheDocument();
      expect(screen.getByText('orders.all_sides')).toBeInTheDocument();
    });
  });

  it('renders strategy options in filter dropdown', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('binance - BTC/USDT')).toBeInTheDocument();
      expect(screen.getByText('huobi - ETH/USDT')).toBeInTheDocument();
    });
  });

  it('renders statistics labels', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('order.total_orders')).toBeInTheDocument();
      expect(screen.getByText('order.buy_orders')).toBeInTheDocument();
      expect(screen.getByText('order.sell_orders')).toBeInTheDocument();
      expect(screen.getByText('order.total_invested')).toBeInTheDocument();
      expect(screen.getByText('orders.total_revenue')).toBeInTheDocument();
      expect(screen.getByText('orders.total_profit')).toBeInTheDocument();
    });
  });

  it('renders go back link to /aip', async () => {
    setupDefaultMocks();
    render(<OrderHistory />);
    await waitFor(() => {
      const link = screen.getByText('action.go_back');
      expect(link.closest('a')).toHaveAttribute('href', '/aip');
    });
  });
});
