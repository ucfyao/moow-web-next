import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders footer with i18n navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('about_us')).toBeInTheDocument();
    expect(screen.getByText('faqs')).toBeInTheDocument();
    expect(screen.getByText('use_tutorial')).toBeInTheDocument();
    expect(screen.getByText('business_cooperation')).toBeInTheDocument();
  });

  it('renders copyright text with i18n key', () => {
    render(<Footer />);
    expect(screen.getByText('copy_right')).toBeInTheDocument();
  });

  it('renders social media icons', () => {
    render(<Footer />);
    expect(screen.getByAltText('Mail')).toBeInTheDocument();
    expect(screen.getByAltText('Telegram')).toBeInTheDocument();
  });
});
