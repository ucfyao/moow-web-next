import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import useUserStore from '@/store/user';

describe('useUserStore (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUserStore.setState({ userInfo: null });
    });
  });

  it('has null userInfo as initial state', () => {
    const { userInfo } = useUserStore.getState();
    expect(userInfo).toBeNull();
  });

  it('updates userInfo with setUserInfo', () => {
    const user = { email: 'test@example.com', name: 'Test User' };

    act(() => {
      useUserStore.getState().setUserInfo(user);
    });

    const { userInfo } = useUserStore.getState();
    expect(userInfo).toEqual(user);
    expect(userInfo?.email).toBe('test@example.com');
  });

  it('clears userInfo with setUserInfo(null)', () => {
    act(() => {
      useUserStore.getState().setUserInfo({ email: 'test@example.com' });
    });
    expect(useUserStore.getState().userInfo).not.toBeNull();

    act(() => {
      useUserStore.getState().setUserInfo(null);
    });
    expect(useUserStore.getState().userInfo).toBeNull();
  });
});
