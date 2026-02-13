import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders footer with navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('About us')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Use Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Business Partner')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/AntClony All right reserved/)).toBeInTheDocument();
  });

  it('renders social media icons', () => {
    render(<Footer />);
    expect(screen.getByAltText('Mail')).toBeInTheDocument();
    expect(screen.getByAltText('Telegram')).toBeInTheDocument();
  });
});
