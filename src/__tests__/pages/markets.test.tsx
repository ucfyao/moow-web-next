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

import MarketsPage from '@/app/aip/markets/page';

describe('MarketsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockDelete.mockReset();
  });

  it('renders skeleton loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<MarketsPage />);
    // Skeleton component renders shimmer elements via Emotion
    // Table should not be visible during loading
    expect(container.querySelector('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no keys', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('empty.no_exchange_keys')).toBeInTheDocument();
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

  it('opens confirm modal and calls delete API when confirmed', async () => {
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

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    // Click delete opens ConfirmModal
    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(screen.getByText('prompt.confirm_action')).toBeInTheDocument();
    });

    // Click confirm button in modal
    const confirmBtn = screen.getByTestId('confirm-button');
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/v1/keys/123');
    });
  });

  it('does not call delete API when modal cancelled', async () => {
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

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    // Click delete opens modal
    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(screen.getByText('prompt.confirm_action')).toBeInTheDocument();
    });

    // Click cancel
    const cancelBtn = screen.getByTestId('cancel-button');
    fireEvent.click(cancelBtn);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('passes pagination params to API', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/keys', {
        params: { pageNumber: 1, pageSize: 20, search: '' },
      });
    });
  });

  it('renders search input', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('placeholder.search_exchange')).toBeInTheDocument();
    });
  });

  it('renders pagination when there are results', async () => {
    const list = Array.from({ length: 5 }, (_, i) => ({
      _id: String(i),
      exchange: `exchange-${i}`,
      access_key: `key-${i}`,
      secret_show: `***${i}`,
      desc: '',
      created_at: '2024-01-15T10:30:00Z',
    }));
    mockGet.mockResolvedValue({ data: { list, total: 25 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('exchange-0')).toBeInTheDocument();
    });
    // Pagination should show total count
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });
});
