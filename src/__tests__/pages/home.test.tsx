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

// Mock DingtouChart component
vi.mock('@/components/DingtouChart', () => ({
  default: (props: any) => <div data-testid="dingtou-chart">DingtouChart</div>,
}));

// Mock next/dynamic to bypass lazy loading in tests.
// Returns the already-mocked DingtouChart component synchronously.
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // Return the mock DingtouChart directly (matches the vi.mock above)
    return (props: any) => <div data-testid="dingtou-chart">DingtouChart</div>;
  },
}));

// Mock Swiper modules
vi.mock('swiper/react', () => ({
  Swiper: ({ children, ...props }: any) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}));

vi.mock('swiper/modules', () => ({
  Pagination: {},
  Autoplay: {},
}));

vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/pagination', () => ({}));

// Mock image import
vi.mock('@/assets/images/icon-down.png', () => ({
  default: '/icon-down.png',
}));

import Home from '@/app/page';

describe('Home', () => {
  beforeEach(() => {
    mockGet.mockReset();
    // Default: API calls resolve with empty data
    mockGet.mockRejectedValue(new Error('API unavailable'));
  });

  it('renders the homepage with pain points section', () => {
    render(<Home />);
    expect(screen.getByText('home.pain_points_title')).toBeInTheDocument();
    expect(screen.getByText('home.pain_points')).toBeInTheDocument();
    expect(screen.getByText('home.solutions')).toBeInTheDocument();
  });

  it('renders the swiper banner section', () => {
    render(<Home />);
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    expect(screen.getAllByTestId('swiper-slide').length).toBe(3);
  });

  it('renders the why choose us section with features', () => {
    render(<Home />);
    expect(screen.getByText('home.why_choose_us')).toBeInTheDocument();
    expect(screen.getByText('home.feature_1')).toBeInTheDocument();
    expect(screen.getByText('home.feature_2')).toBeInTheDocument();
    expect(screen.getByText('home.feature_3')).toBeInTheDocument();
    expect(screen.getByText('home.feature_4')).toBeInTheDocument();
  });

  it('renders the CTA button linking to /aip', () => {
    render(<Home />);
    const ctaButton = screen.getByText('home.go_invest');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/aip');
  });

  it('renders the live data section with DingtouChart', () => {
    render(<Home />);
    expect(screen.getByText('home.live_data')).toBeInTheDocument();
    expect(screen.getByTestId('dingtou-chart')).toBeInTheDocument();
  });

  it('renders the try it button linking to /aip', () => {
    render(<Home />);
    const tryItButton = screen.getByText('home.try_it');
    expect(tryItButton).toBeInTheDocument();
    expect(tryItButton.closest('a')).toHaveAttribute('href', '/aip');
  });

  it('renders pain point details in dd elements', () => {
    render(<Home />);
    // Pain point lines are in <dd> elements with <br> separating two lines,
    // so getByText won't match each line individually. Use regex partial match.
    expect(screen.getByText(/home\.pain_1_line1/)).toBeInTheDocument();
    expect(screen.getByText(/home\.pain_2_line1/)).toBeInTheDocument();
    expect(screen.getByText(/home\.pain_3_line1/)).toBeInTheDocument();
    expect(screen.getByText(/home\.pain_4_line1/)).toBeInTheDocument();
  });

  it('renders solution details', () => {
    render(<Home />);
    expect(screen.getByText('home.solution_1')).toBeInTheDocument();
    expect(screen.getByText('home.solution_2')).toBeInTheDocument();
    expect(screen.getByText('home.solution_3')).toBeInTheDocument();
    expect(screen.getByText('home.solution_4')).toBeInTheDocument();
  });
});
