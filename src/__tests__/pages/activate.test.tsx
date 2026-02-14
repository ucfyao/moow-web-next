import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock next/navigation with params
vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/activate/123',
    useSearchParams: () => new URLSearchParams('email=test@test.com'),
    useParams: () => ({ userId: '123' }),
  };
});

import ActivatePage from '@/app/activate/[userId]/page';

describe('ActivatePage', () => {
  it('renders activation page with i18n keys', () => {
    render(<ActivatePage />);
    expect(screen.getByText('caption.account_not_active')).toBeInTheDocument();
    expect(screen.getByText('prompt.account_not_active')).toBeInTheDocument();
    expect(screen.getByText('action.resend_activate_email')).toBeInTheDocument();
  });

  it('renders resend button', () => {
    render(<ActivatePage />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
