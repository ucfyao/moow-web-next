import { createStore } from 'redux';
import auth from '../app/utils/auth';

function getLoggedUser() {
  return typeof window !== 'undefined' ? auth.getUser() : null;
}

function isAuthenticated() {
  return typeof window !== 'undefined' ? auth.isAuthenticated() : false;
}

function getLocale() {
  return typeof window !== 'undefined' ? auth.getLocale() : 'zh';
}

// Define Initial state
const initialState = {
  locales: ['en', 'zh'],
  locale: getLocale(),
  refreshInterval: 60,  //
  user: getLoggedUser(),
  isAuthenticated: isAuthenticated(),
};

// Define action types
const SET_LOCALE = 'SET_LOCALE';
const SET_USER = 'SET_USER';
const SET_USER_ACTIVATED = 'SET_USER_ACTIVATED';
const SET_ISAUTHENTICATED = 'SET_ISAUTHENTICATED';
const SET_REFRESHINTERVAL = 'SET_REFRESHINTERVAL';

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.payload
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload || null
      };
    case SET_USER_ACTIVATED:
      return {
        ...state,
        user: {
          ...state.user,
          isActivated: action.payload
        }
      };
    case SET_ISAUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload
      };
    case SET_REFRESHINTERVAL:
      return {
        ...state,
        refreshInterval: action.payload
      };
    default:
      return state;
  }
};

export const store = createStore(reducer);

// Define actions
export const setLocale = (locale) => ({
  type: SET_LOCALE,
  payload: locale
});

export const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

export const setUserActivated = (activated = true) => ({
  type: SET_USER_ACTIVATED,
  payload: activated
});

export const setIsAuthenticated = (isAuthenticated) => ({
  type: SET_ISAUTHENTICATED,
  payload: isAuthenticated
});

export const setRefreshInterval = (refreshInterval) => ({
  type: SET_REFRESHINTERVAL,
  payload: refreshInterval
});

// Initialize the store
export const initializeStore = (preloadedState) => {
  return createStore(
    reducer,
    preloadedState
  );
};
