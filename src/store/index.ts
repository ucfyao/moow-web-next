import { legacy_createStore as createStore } from 'redux';
import auth from '../utils/auth';

const initialState = {
  locales: ['en', 'zh'],
  locale: auth.getLocale(),
  refreshInterval: 60,
  user: auth.getUser(),
  isAuthenticated: auth.isAuthenticated(),
};

interface Action {
  type: string;
  payload?: any;
}

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'SET_LOCALE':
      return { ...state, locale: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload || null };
    case 'SET_ISAUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_REFRESHINTERVAL':
      return { ...state, refreshInterval: action.payload };
    default:
      return state;
  }
};

export const setLocale = (locale: string) => ({ type: 'SET_LOCALE', payload: locale });
export const setUser = (user: any) => ({ type: 'SET_USER', payload: user });
export const setIsAuthenticated = (isAuthenticated: boolean) => ({
  type: 'SET_ISAUTHENTICATED',
  payload: isAuthenticated,
});
export const setRefreshInterval = (refreshInterval: number) => ({
  type: 'SET_REFRESHINTERVAL',
  payload: refreshInterval,
});

const store = createStore(reducer);

export default store;
