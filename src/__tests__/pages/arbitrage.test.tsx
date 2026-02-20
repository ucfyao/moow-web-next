import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

import ArbitragePage from '@/app/arbitrage/page';

const mockOpportunitiesResponse = {
  data: {
    list: [
      {
        symbol: 'BTC/USDT',
        from: { exchange: 'binance', symbol: 'BTC/USDT', bid: 41800, ask: 41850, last: 41820 },
        to: { exchange: 'huobi', symbol: 'BTC/USDT', bid: 42100, ask: 42150, last: 42090 },
        diff: '0.60',
        rawdiff: 0.6,
      },
      {
        symbol: 'ETH/USDT',
        from: { exchange: 'okex', symbol: 'ETH/USDT', bid: 2780, ask: 2785, last: 2782 },
        to: { exchange: 'binance-sell', symbol: 'ETH/USDT', bid: 2810, ask: 2815, last: 2808 },
        diff: '3.20',
        rawdiff: 3.2,
      },
    ],
  },
};

describe('ArbitragePage', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('renders page heading', () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    expect(screen.getByText('title.arbitrage_opportunities')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ArbitragePage />);
    expect(screen.getByText('prompt.loading')).toBeInTheDocument();
  });

  it('fetches arbitrage data on mount', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/arbitrage/opportunities', {
        params: { minProfit: 1 },
      });
    });
  });

  it('displays arbitrage opportunities after loading', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    await waitFor(() => {
      expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
      expect(screen.getByText('binance')).toBeInTheDocument();
      expect(screen.getByText('huobi')).toBeInTheDocument();
      expect(screen.getByText('0.60%')).toBeInTheDocument();
      expect(screen.getByText('3.20%')).toBeInTheDocument();
    });
  });

  it('renders table headers when data loaded', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    await waitFor(() => {
      expect(screen.getByText('title.symbol')).toBeInTheDocument();
      expect(screen.getByText('title.buy_from')).toBeInTheDocument();
      expect(screen.getByText('title.buy_price')).toBeInTheDocument();
      expect(screen.getByText('title.sell_to')).toBeInTheDocument();
      expect(screen.getByText('title.sell_price')).toBeInTheDocument();
      expect(screen.getByText('title.diff_percent')).toBeInTheDocument();
    });
  });

  it('shows empty state when no opportunities', async () => {
    mockGet.mockResolvedValue({ data: { list: [] } });
    render(<ArbitragePage />);
    await waitFor(() => {
      expect(screen.getByText('prompt.no_arbitrage_opportunities')).toBeInTheDocument();
    });
  });

  it('renders min profit filter input', () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    expect(screen.getByText(/label.min_profit/)).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    expect(screen.getByText('action.refresh')).toBeInTheDocument();
  });

  it('refetches data when refresh button is clicked', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    const callCountBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByText('action.refresh'));
    await waitFor(() => {
      expect(mockGet.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  it('displays last updated time after data loads', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    await waitFor(() => {
      expect(screen.getByText(/label.last_updated/)).toBeInTheDocument();
      expect(screen.getByText(/label.auto_refresh_30s/)).toBeInTheDocument();
    });
  });

  it('displays buy and sell prices', async () => {
    mockGet.mockResolvedValue(mockOpportunitiesResponse);
    render(<ArbitragePage />);
    await waitFor(() => {
      // ask price for BTC buy from
      expect(screen.getByText('41850.00')).toBeInTheDocument();
      // bid price for BTC sell to
      expect(screen.getByText('42100.00')).toBeInTheDocument();
    });
  });
});
