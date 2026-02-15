import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders action link when actionText and actionHref are provided', () => {
    render(<EmptyState title="No data" actionText="Go home" actionHref="/home" />);
    const link = screen.getByText('Go home');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/home');
    expect(link.className).toContain('is-link');
  });

  it('does not render action link when actionText is missing', () => {
    render(<EmptyState title="No data" actionHref="/home" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render action link when actionHref is missing', () => {
    render(<EmptyState title="No data" actionText="Go home" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="No data" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not render icon container when icon is not provided', () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(container.querySelector('[data-testid="empty-state"] > div > div')).toBeNull();
  });

  it('has correct test id', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
