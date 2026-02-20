import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import AboutPage from '@/app/about/page';

describe('AboutPage', () => {
  it('renders the about page heading with i18n key', () => {
    render(<AboutPage />);
    expect(screen.getByText('about_xiaobo')).toBeInTheDocument();
  });

  it('renders the XBT section heading with i18n key', () => {
    render(<AboutPage />);
    expect(screen.getByText('about_xbt')).toBeInTheDocument();
  });

  it('renders static descriptive content about the platform', () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/cryptocurrency automated investment platform/i),
    ).toBeInTheDocument();
  });

  it('renders static content about XBT token', () => {
    render(<AboutPage />);
    expect(screen.getByText(/XBT is the platform token/i)).toBeInTheDocument();
  });
});
