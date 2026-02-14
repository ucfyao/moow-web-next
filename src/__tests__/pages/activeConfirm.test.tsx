import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// Mock axios
const mockPatch = vi.fn();
vi.mock('axios', () => ({
  default: {
    patch: (...args: any[]) => mockPatch(...args),
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
    usePathname: () => '/activeConfirm/test-token',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({ token: 'test-token' }),
  };
});

import ActiveConfirm from '@/app/activeConfirm/[token]/page';

describe('ActiveConfirm', () => {
  beforeEach(() => {
    mockPatch.mockReset();
  });

  it('renders initial state with sign in button', () => {
    mockPatch.mockReturnValue(new Promise(() => {}));
    render(<ActiveConfirm />);
    expect(screen.getByText('sign_in_now')).toBeInTheDocument();
  });

  it('calls activation API with token', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    await act(async () => {
      render(<ActiveConfirm />);
    });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/auth/verification', { token: 'test-token' });
  });

  it('renders page structure', () => {
    mockPatch.mockReturnValue(new Promise(() => {}));
    render(<ActiveConfirm />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
