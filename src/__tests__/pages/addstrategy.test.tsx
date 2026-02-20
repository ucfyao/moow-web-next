import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    patch: (...args: any[]) => mockPatch(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

// Mock validator
vi.mock('@/utils/validator', () => ({
  getInvalidFields: vi.fn(() => Promise.resolve(false)),
  validateField: vi.fn(() => Promise.resolve(null)),
}));

import AddStrategyPage from '@/app/aip/addstrategy/page';

describe('AddStrategyPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();

    // Default: symbols API returns empty list, keys returns empty list
    mockGet.mockImplementation((url: string) => {
      if (url === '/v1/symbols') {
        return Promise.resolve({ data: { list: [] } });
      }
      if (url === '/v1/keys') {
        return Promise.resolve({ data: { list: [] } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders the create strategy form heading', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('caption.new_plan')).toBeInTheDocument();
    });
  });

  it('renders go back button', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('action.go_back')).toBeInTheDocument();
    });
  });

  it('renders exchange key selection section', async () => {
    render(<AddStrategyPage />);
    // The label contains "label.select" + "label.exchange_apikey" as separate text nodes
    // Use aria-label on the key buttons or find the text within the label
    await waitFor(() => {
      const label = screen.getByText(
        (content, element) =>
          element?.tagName === 'LABEL' &&
          !!element.textContent?.includes('label.exchange_apikey'),
      );
      expect(label).toBeInTheDocument();
    });
  });

  it('renders symbol selection section', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      const label = screen.getByText(
        (content, element) =>
          element?.tagName === 'LABEL' &&
          !!element.textContent?.includes('label.symbol') &&
          !!element.textContent?.includes('label.select'),
      );
      expect(label).toBeInTheDocument();
    });
  });

  it('renders plan type selection with price investment option', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('label.price_investment')).toBeInTheDocument();
    });
  });

  it('renders single purchase amount input', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('placeholder.input_single_purchase_amount'),
      ).toBeInTheDocument();
    });
  });

  it('renders period selection with daily/weekly/monthly options', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('label.daily')).toBeInTheDocument();
      expect(screen.getByText('label.weekly')).toBeInTheDocument();
      expect(screen.getByText('label.monthly')).toBeInTheDocument();
    });
  });

  it('renders stop profit and drawdown inputs', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('placeholder.stop_profit_percentage')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('placeholder.drawdown_percentage')).toBeInTheDocument();
    });
  });

  it('renders submit button for new strategy', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('action.submit')).toBeInTheDocument();
    });
  });

  it('renders exchange key list from API', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/v1/symbols') {
        return Promise.resolve({ data: { list: [] } });
      }
      if (url === '/v1/keys') {
        return Promise.resolve({
          data: {
            list: [
              {
                _id: 'k1',
                exchange: 'binance',
                name: 'My Binance Key',
                access_key: 'abc123defghijklm',
                secret_key: 'secret123',
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('My Binance Key')).toBeInTheDocument();
      expect(screen.getByText(/Access Key: abc1\*\*\*\*klm/)).toBeInTheDocument();
    });
  });

  it('renders add new exchange API key link', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(screen.getByText('action.new_exchange_apikey')).toBeInTheDocument();
    });
  });

  it('fetches symbols and keys on mount', async () => {
    render(<AddStrategyPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/v1/symbols');
      expect(mockGet).toHaveBeenCalledWith('/v1/keys');
    });
  });
});
