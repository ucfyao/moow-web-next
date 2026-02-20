import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
    delete: (...args: any[]) => mockDelete(...args),
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

import StrategyList from '@/app/aip/page';

describe('StrategyList Page', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
  });

  it('renders loading skeleton initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<StrategyList />);
    expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
  });

  it('fetches strategies on mount with pagination params', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<StrategyList />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/strategies', {
        params: { pageNumber: 1, pageSize: 20 },
      });
    });
  });

  it('renders empty state when no strategies', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('empty.no_strategies')).toBeInTheDocument();
      expect(screen.getByText('empty.create_first_strategy')).toBeInTheDocument();
    });
  });

  it('renders strategy list when data is loaded', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's1',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'binance',
            symbol: 'BTC/USDT',
            base_total: 1000,
            quote_total: 0.05,
            price_native: 42000,
            profit: 500,
            profit_percentage: 5.2,
            status: 1,
          },
        ],
        total: 1,
      },
    });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('binance')).toBeInTheDocument();
      expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    });
  });

  it('renders action buttons for each strategy', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's1',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'binance',
            symbol: 'BTC/USDT',
            base_total: 1000,
            quote_total: 0.05,
            price_native: 42000,
            profit: 500,
            profit_percentage: 5.2,
            status: 1,
          },
        ],
        total: 1,
      },
    });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('action.edit')).toBeInTheDocument();
      expect(screen.getByText('action.disable')).toBeInTheDocument();
      expect(screen.getByText('action.view')).toBeInTheDocument();
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });
  });

  it('shows enable button for stopped strategies', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's2',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'huobi',
            symbol: 'ETH/USDT',
            base_total: 500,
            quote_total: 1.5,
            price_native: 2800,
            profit: -100,
            profit_percentage: -3.1,
            status: 2,
          },
        ],
        total: 1,
      },
    });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('action.enable')).toBeInTheDocument();
    });
  });

  it('renders new plan link', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<StrategyList />);
    await waitFor(() => {
      // The "new plan" link appears in the page header and also in the empty state
      const links = screen.getAllByText('action.new_plan');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders investment plans tab heading', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('caption.investment_plans')).toBeInTheDocument();
    });
  });

  it('renders table headers when strategies exist', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's1',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'binance',
            symbol: 'BTC/USDT',
            base_total: 1000,
            quote_total: 0.05,
            price_native: 42000,
            profit: 500,
            profit_percentage: 5.2,
            status: 1,
          },
        ],
        total: 1,
      },
    });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('title.create_time')).toBeInTheDocument();
      expect(screen.getByText('title.exchange')).toBeInTheDocument();
      expect(screen.getByText('title.symbol')).toBeInTheDocument();
      expect(screen.getByText('title.status')).toBeInTheDocument();
      expect(screen.getByText('title.operations')).toBeInTheDocument();
    });
  });

  it('opens delete confirm modal when delete is clicked', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's1',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'binance',
            symbol: 'BTC/USDT',
            base_total: 1000,
            quote_total: 0.05,
            price_native: 42000,
            profit: 500,
            profit_percentage: 5.2,
            status: 1,
          },
        ],
        total: 1,
      },
    });
    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(screen.getByText('prompt.confirm_action')).toBeInTheDocument();
      expect(screen.getByText('prompt.confirm_delete_strategy')).toBeInTheDocument();
    });
  });

  it('calls delete API when confirm modal is confirmed', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: 's1',
            created_at: '2024-01-15T10:30:00Z',
            exchange: 'binance',
            symbol: 'BTC/USDT',
            base_total: 1000,
            quote_total: 0.05,
            price_native: 42000,
            profit: 500,
            profit_percentage: 5.2,
            status: 1,
          },
        ],
        total: 1,
      },
    });
    mockDelete.mockResolvedValue({});

    render(<StrategyList />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/v1/strategies/s1');
    });
  });
});
