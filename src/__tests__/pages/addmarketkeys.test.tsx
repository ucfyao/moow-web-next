import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockPost = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock validator
const mockGetInvalidFields = vi.fn();
vi.mock('@/utils/validator', () => ({
  getInvalidFields: (...args: any[]) => mockGetInvalidFields(...args),
}));

import AddMarketKeysPage from '@/app/aip/addmarketkeys/page';

describe('AddMarketKeysPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGetInvalidFields.mockReset();
  });

  it('renders the form with exchange list', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByText('Binance')).toBeInTheDocument();
    expect(screen.getByText('Huobi')).toBeInTheDocument();
    expect(screen.getByText('OKEx')).toBeInTheDocument();
  });

  it('renders form input fields', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByPlaceholderText('placeholder.access_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.secret_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.remark')).toBeInTheDocument();
  });

  it('shows validation errors when form is invalid', async () => {
    mockGetInvalidFields.mockResolvedValue({
      exchange: 'validator.exchange_cant_empty',
      access_key: 'validator.key_cant_empty',
    });

    render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(screen.getByText('validator.exchange_cant_empty')).toBeInTheDocument();
      expect(screen.getByText('validator.key_cant_empty')).toBeInTheDocument();
    });
  });

  it('highlights selected exchange', () => {
    const { container } = render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('Binance'));

    const activeItem = container.querySelector('.exchange-item.active');
    expect(activeItem).toBeInTheDocument();
  });

  it('submits form data to API when valid', async () => {
    mockGetInvalidFields.mockResolvedValue(false);
    mockPost.mockResolvedValue({ data: { _id: '123' } });

    render(<AddMarketKeysPage />);

    // Select exchange
    fireEvent.click(screen.getByText('Binance'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('placeholder.access_key'), {
      target: { value: 'test-key', name: 'access_key' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.secret_key'), {
      target: { value: 'test-secret', name: 'secret_key' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.remark'), {
      target: { value: 'test desc', name: 'desc' },
    });

    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/v1/keys', {
        exchange: 'binance',
        access_key: 'test-key',
        secret_key: 'test-secret',
        desc: 'test desc',
      });
    });
  });

  it('shows error alert when API fails', async () => {
    mockGetInvalidFields.mockResolvedValue(false);
    mockPost.mockRejectedValue({ message: 'Invalid API key' });

    render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('Binance'));
    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument();
    });
  });

  it('renders go back button', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByText('action.go_back')).toBeInTheDocument();
  });
});
