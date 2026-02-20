import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import ErrorPage from '@/app/error/page';

describe('ErrorPage', () => {
  it('renders 404 error code', () => {
    render(<ErrorPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders page not found message with i18n key', () => {
    render(<ErrorPage />);
    expect(screen.getByText('page_not_found')).toBeInTheDocument();
  });

  it('renders back to home link', () => {
    render(<ErrorPage />);
    const homeLink = screen.getByText('back_to_home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders with primary button styling for home link', () => {
    render(<ErrorPage />);
    const homeLink = screen.getByText('back_to_home');
    expect(homeLink).toHaveClass('button', 'is-primary');
  });
});
