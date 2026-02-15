import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from '@/components/Skeleton';

describe('Skeleton', () => {
  it('renders with default text variant', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders multiple text lines with count', () => {
    const { container } = render(<Skeleton count={3} />);
    const bars = container.querySelectorAll('[data-testid="skeleton"] > div');
    expect(bars).toHaveLength(3);
  });

  it('renders single text line by default', () => {
    const { container } = render(<Skeleton variant="text" />);
    const bars = container.querySelectorAll('[data-testid="skeleton"] > div');
    expect(bars).toHaveLength(1);
  });

  it('renders rect variant', () => {
    render(<Skeleton variant="rect" width={200} height={100} />);
    const el = screen.getByTestId('skeleton');
    expect(el).toBeInTheDocument();
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('100px');
  });

  it('renders circle variant', () => {
    render(<Skeleton variant="circle" width={50} />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.width).toBe('50px');
    expect(el.style.height).toBe('50px');
  });

  it('accepts string width and height', () => {
    render(<Skeleton variant="rect" width="80%" height="2rem" />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.width).toBe('80%');
    expect(el.style.height).toBe('2rem');
  });

  it('uses default dimensions for rect when not provided', () => {
    render(<Skeleton variant="rect" />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('100px');
  });

  it('uses default size for circle when not provided', () => {
    render(<Skeleton variant="circle" />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.width).toBe('40px');
    expect(el.style.height).toBe('40px');
  });
});
