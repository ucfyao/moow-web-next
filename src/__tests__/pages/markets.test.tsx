import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

// Mock util
vi.mock('@/utils/util', () => ({
  default: {
    formatDate: (date: string) => '2024-01-15 10:30:00',
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', { value: mockConfirm, writable: true });

import MarketsPage from '@/app/aip/markets/page';

describe('MarketsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockDelete.mockReset();
    mockConfirm.mockReset();
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<MarketsPage />);
    expect(screen.getByText('prompt.loading')).toBeInTheDocument();
  });

  it('renders empty state when no keys', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('prompt.no_exchange_keys')).toBeInTheDocument();
    });
  });

  it('renders key list from API', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '1',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'My Binance',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('binance')).toBeInTheDocument();
      expect(screen.getByText('abc***xyz')).toBeInTheDocument();
      expect(screen.getByText('***xyz')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15 10:30:00')).toBeInTheDocument();
    });
  });

  it('renders add key link', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      const link = screen.getByText('action.new_exchange_apikey');
      expect(link.closest('a')).toHaveAttribute('href', '/aip/addmarketkeys');
    });
  });

  it('calls delete API when confirmed', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '123',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'test',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    mockDelete.mockResolvedValue({});
    mockConfirm.mockReturnValue(true);

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/v1/keys/123');
    });
  });

  it('does not call delete API when cancelled', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '123',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'test',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    mockConfirm.mockReturnValue(false);

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
