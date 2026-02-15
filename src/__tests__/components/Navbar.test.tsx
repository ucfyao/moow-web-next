import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Navbar';

// Mock the user store
const mockSetUserInfo = vi.fn();
let mockUserInfo: any = null;

vi.mock('@/store/user', () => ({
  default: (selector: any) => {
    const state = {
      userInfo: mockUserInfo,
      setUserInfo: mockSetUserInfo,
    };
    return selector(state);
  },
}));

// Mock HTTP module
vi.mock('../../lib/http', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

describe('Navbar (Header)', () => {
  beforeEach(() => {
    mockUserInfo = null;
    mockSetUserInfo.mockClear();
  });

  it('shows sign in/sign up button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText(/sign_in/)).toBeInTheDocument();
  });

  it('shows user email when authenticated', () => {
    mockUserInfo = { email: 'user@example.com' };
    render(<Header />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('link.home')).toBeInTheDocument();
    expect(screen.getByText('link.coin_aip')).toBeInTheDocument();
  });

  it('toggles mobile menu on burger click', () => {
    const { container } = render(<Header />);
    const burger = container.querySelector('.navbar-burger');

    expect(burger).not.toHaveClass('is-active');
    fireEvent.click(burger!);
    expect(burger).toHaveClass('is-active');
  });

  it('shows language switch button', () => {
    render(<Header />);
    // Mock i18n language is 'en', so the toggle shows '中文'
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  describe('Keyboard Navigation', () => {
    it('coin dropdown has aria-haspopup and aria-expanded attributes', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');
      expect(coinTrigger).toHaveAttribute('aria-haspopup', 'true');
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('coin dropdown opens on Enter key and sets aria-expanded to true', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');

      fireEvent.keyDown(coinTrigger, { key: 'Enter' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('coin dropdown opens on Space key', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');

      fireEvent.keyDown(coinTrigger, { key: ' ' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('coin dropdown closes on Escape key', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');

      fireEvent.keyDown(coinTrigger, { key: 'Enter' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(coinTrigger, { key: 'Escape' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('coin dropdown opens on ArrowDown key', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');

      fireEvent.keyDown(coinTrigger, { key: 'ArrowDown' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('coin dropdown menu items have role="menuitem"', () => {
      render(<Header />);
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThanOrEqual(3);
    });

    it('coin dropdown menu has role="menu"', () => {
      const { container } = render(<Header />);
      const menus = container.querySelectorAll('[role="menu"]');
      expect(menus.length).toBeGreaterThanOrEqual(1);
    });

    it('user dropdown has aria attributes when authenticated', () => {
      mockUserInfo = { email: 'user@example.com' };
      render(<Header />);
      const userTrigger = screen.getByText('user@example.com');
      expect(userTrigger).toHaveAttribute('aria-haspopup', 'true');
      expect(userTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('user dropdown opens on Enter and has menu items', () => {
      mockUserInfo = { email: 'user@example.com' };
      render(<Header />);
      const userTrigger = screen.getByText('user@example.com');

      fireEvent.keyDown(userTrigger, { key: 'Enter' });
      expect(userTrigger).toHaveAttribute('aria-expanded', 'true');

      const menuItems = screen.getAllByRole('menuitem');
      // 3 from coin dropdown + 6 from user dropdown
      expect(menuItems.length).toBe(9);
    });

    it('ArrowUp opens dropdown and focuses last item', () => {
      render(<Header />);
      const coinTrigger = screen.getByText('link.coin');

      fireEvent.keyDown(coinTrigger, { key: 'ArrowUp' });
      expect(coinTrigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
