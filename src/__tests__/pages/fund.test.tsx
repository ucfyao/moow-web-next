import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

// Mock Highcharts
vi.mock('highcharts', () => ({
  default: {
    chart: vi.fn(),
  },
}));

import FundPage from '@/app/fund/page';

describe('FundPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    // Default: API call rejects so BTC history stays empty
    mockGet.mockRejectedValue(new Error('API unavailable'));
  });

  it('renders the fund page heading with i18n key', () => {
    render(<FundPage />);
    expect(screen.getByText('index_fund')).toBeInTheDocument();
  });

  it('renders two fund cards with i18n keys', () => {
    render(<FundPage />);
    expect(screen.getByText('b10_index_fund')).toBeInTheDocument();
    expect(screen.getByText('xiaobao_fund')).toBeInTheDocument();
  });

  it('renders fund status labels', () => {
    render(<FundPage />);
    const statusElements = screen.getAllByText('status_open');
    expect(statusElements.length).toBe(2);
  });

  it('renders fund metrics labels', () => {
    render(<FundPage />);
    const change24hElements = screen.getAllByText('change_24h');
    expect(change24hElements.length).toBe(2);

    const changeWeekElements = screen.getAllByText('change_week');
    expect(changeWeekElements.length).toBe(2);

    const changeMonthElements = screen.getAllByText('change_month');
    expect(changeMonthElements.length).toBe(2);
  });

  it('renders fund size for each fund card', () => {
    render(<FundPage />);
    const fundSizeLabels = screen.getAllByText('fund_size');
    expect(fundSizeLabels.length).toBe(2);

    expect(screen.getByText('125,000 USDT')).toBeInTheDocument();
    expect(screen.getByText('80,000 USDT')).toBeInTheDocument();
  });

  it('renders loading placeholder when BTC history is empty', () => {
    render(<FundPage />);
    const loadingElements = screen.getAllByText('prompt.loading');
    expect(loadingElements.length).toBe(2);
  });
});
