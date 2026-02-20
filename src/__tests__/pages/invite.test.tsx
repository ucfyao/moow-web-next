import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock axios
const mockGet = vi.fn();
vi.mock('axios', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

// Mock auth
const mockIsAuthenticated = vi.fn(() => true);
const mockGetUser = vi.fn(() => ({ _id: 'user1', seq_id: 'seq1' }));
vi.mock('@/utils/auth', () => ({
  default: {
    isAuthenticated: () => mockIsAuthenticated(),
    getUser: () => mockGetUser(),
    getToken: vi.fn(() => 'token123'),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any, fmt: string) => '2025/01/15 10:00',
}));

// Mock Skeleton component
vi.mock('@/components/Skeleton', () => ({
  default: (props: any) => <div data-testid="skeleton">Loading...</div>,
}));

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: (props: any) => <canvas data-testid="qr-code" data-value={props.value} />,
}));

// Mock image import
vi.mock('@/assets/images/no_record.png', () => ({
  default: '/no_record.png',
}));

import InvitePage from '@/app/ucenter/invite/page';

function setupMockGet(
  userData: Record<string, any>,
  invitations: any[] = [],
) {
  mockGet.mockImplementation((url: string, config?: any) => {
    if (config?.params?.invitations) {
      return Promise.resolve({
        data: { data: { invitations } },
      });
    }
    return Promise.resolve({
      data: { data: userData },
    });
  });
}

describe('InvitePage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUser.mockReturnValue({ _id: 'user1', seq_id: 'seq1' });
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<InvitePage />);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders invite title after loading', async () => {
    setupMockGet({
      invitation_code: 'ABC123',
      invite_reward: '5',
      invite_total: '500',
    });

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText('invite.title')).toBeInTheDocument();
    });
  });

  it('displays invite code after loading', async () => {
    setupMockGet({
      invitation_code: 'XYZ789',
      invite_reward: '3',
      invite_total: '300',
    });

    render(<InvitePage />);
    await waitFor(() => {
      // Code appears in invite-code-display and also in hidden poster section
      const codeElements = screen.getAllByText('XYZ789');
      expect(codeElements.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText('invite.your_invite_code')).toBeInTheDocument();
  });

  it('displays invite link with copy and poster buttons', async () => {
    setupMockGet({
      invitation_code: 'ABC123',
      invite_reward: '5',
      invite_total: '500',
    });

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText('invite.your_invite_link')).toBeInTheDocument();
    });

    expect(screen.getByText('invite.copy_link')).toBeInTheDocument();
    expect(screen.getByText('invite.gen_poster')).toBeInTheDocument();
  });

  it('displays invite stats section', async () => {
    setupMockGet({
      invitation_code: 'ABC123',
      invite_reward: '7',
      invite_total: '700',
    });

    render(<InvitePage />);
    await waitFor(() => {
      // Stats text is in a single div with mixed inline elements, use regex
      expect(screen.getByText(/invite\.invited_count/)).toBeInTheDocument();
    });

    expect(screen.getByText(/invite\.invite_reward/)).toBeInTheDocument();
  });

  it('renders no-invites message when invite list is empty', async () => {
    setupMockGet({
      invitation_code: 'ABC123',
      invite_reward: '0',
      invite_total: '0',
    });

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText('invite.no_invites')).toBeInTheDocument();
    });
  });

  it('renders invite history table when invitations exist', async () => {
    setupMockGet(
      {
        invitation_code: 'ABC123',
        invite_reward: '2',
        invite_total: '200',
      },
      [
        { _id: 'inv1', email: 'alice@example.com', created_at: '2025-01-15T10:00:00Z' },
        { _id: 'inv2', email: 'bob@example.com', created_at: '2025-01-16T10:00:00Z' },
      ],
    );

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText('invite.invitee')).toBeInTheDocument();
    });

    expect(screen.getByText('invite.invite_time')).toBeInTheDocument();
    // Emails are desensitized: first 3 chars + *** + @domain (only when @ index > 3)
    expect(screen.getByText('ali***@example.com')).toBeInTheDocument();
    // 'bob@example.com' has @ at index 3, so it's NOT desensitized
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('renders QR code when invite link is available', async () => {
    setupMockGet({
      invitation_code: 'ABC123',
      invite_reward: '0',
      invite_total: '0',
    });

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getAllByTestId('qr-code').length).toBeGreaterThan(0);
    });
  });
});
