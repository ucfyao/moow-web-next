import { describe, it, expect } from 'vitest';
import store, { setLocale, setUser, setIsAuthenticated, setRefreshInterval } from '@/store/index';

describe('Redux store', () => {
  it('has correct initial state structure', () => {
    const state = store.getState();
    expect(state).toHaveProperty('locales');
    expect(state).toHaveProperty('locale');
    expect(state).toHaveProperty('refreshInterval');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('isAuthenticated');
    expect(state.locales).toEqual(['en', 'zh']);
  });

  it('updates locale with SET_LOCALE action', () => {
    store.dispatch(setLocale('zh'));
    expect(store.getState().locale).toBe('zh');
  });

  it('updates user with SET_USER action', () => {
    const user = { email: 'test@example.com', name: 'Test' };
    store.dispatch(setUser(user));
    expect(store.getState().user).toEqual(user);
  });

  it('sets user to null when SET_USER payload is falsy', () => {
    store.dispatch(setUser(null));
    expect(store.getState().user).toBeNull();
  });

  it('updates isAuthenticated with SET_ISAUTHENTICATED action', () => {
    store.dispatch(setIsAuthenticated(true));
    expect(store.getState().isAuthenticated).toBe(true);

    store.dispatch(setIsAuthenticated(false));
    expect(store.getState().isAuthenticated).toBe(false);
  });

  it('updates refreshInterval with SET_REFRESHINTERVAL action', () => {
    store.dispatch(setRefreshInterval(120));
    expect(store.getState().refreshInterval).toBe(120);
  });
});
