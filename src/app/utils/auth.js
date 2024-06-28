import Cookie from 'js-cookie'

const KEY_OF_LOCALE = 'locale'
const KEY_OF_USER = 'user'
const KEY_OF_TOKEN = 'token'

const KEY_OF_PERMISSION = 'permission'
const KEY_OF_SYMBOLS = 'symbols'
const KEY_OF_EXCHANGES = 'exchanges'
const KEY_OF_REFRESHINTERVAL = 'refreshinterval'
const KEY_OF_ISAUTHENTICATED = 'is-authenticated'

const isClient = typeof window !== 'undefined';

export default {
  getLocale: () => {
    return isClient ? window.localStorage.getItem(KEY_OF_LOCALE) || 'zh' : 'zh';
  },
  setLocale: (locale) => {
    if (isClient) {
      window.localStorage.setItem(KEY_OF_LOCALE, locale);
      Cookie.set(KEY_OF_LOCALE, locale)
    }
  },
  login: (loginData) => {
    if (typeof loginData === 'object' && isClient) {
      const user = loginData.user;
      const token = loginData.token;
      const permissionList = loginData.permission && (loginData.permission.resource || []);
      const permission = {};
      permissionList.forEach(item => {
        permission[item.resourceCode] = item
      });
      window.localStorage.setItem(KEY_OF_USER, JSON.stringify(user));
      window.localStorage.setItem(KEY_OF_TOKEN, token);

      window.localStorage.setItem(KEY_OF_PERMISSION, JSON.stringify(permission));
      window.localStorage.setItem(KEY_OF_ISAUTHENTICATED, 'true');
      return true
    }
    return false
  },
  logout: () => {
    if (isClient) {
      window.localStorage.removeItem(KEY_OF_USER)
      window.localStorage.removeItem(KEY_OF_TOKEN)
      window.localStorage.removeItem(KEY_OF_PERMISSION)
      window.localStorage.removeItem(KEY_OF_ISAUTHENTICATED)
    }
  },
  isAuthenticated: function() {
    return isClient && window.localStorage.getItem(KEY_OF_ISAUTHENTICATED) === 'true'
  },
  getToken: () => {
    return isClient ? window.localStorage.getItem(KEY_OF_TOKEN) : null;
  },
  getUser: () => {
    let user = null
    if (isClient) {
      try {
        let rawdata = window.localStorage.getItem(KEY_OF_USER)
        user = JSON.parse(rawdata)
      } catch (error) {
        console.log(error)
      }
    }
    return user
  },
  hasPermission: (code) => {
    let permission = {}
    if (isClient) {
      try {
        let rawdata = window.localStorage.getItem(KEY_OF_PERMISSION)
        permission = JSON.parse(rawdata) || {}
      } catch (error) {
        console.log(error)
      }
    }
    return permission[code]
  },
  setAsLoggedOut: () => {
    if (isClient) {
      window.localStorage.setItem(KEY_OF_ISAUTHENTICATED, 'false')
    }
  },
  setSymbols: (symbols) => {
    if (Array.isArray(symbols) && isClient) {
      window.localStorage.setItem(KEY_OF_SYMBOLS, symbols)
    }
  },
  getSymbols: () => {
    if (isClient) {
      let rawStr = window.localStorage.getItem(KEY_OF_SYMBOLS) || ''
      return rawStr.split(',').filter(item => item)
    }
    return []
  },
  setExchanges: (exchanges) => {
    if (Array.isArray(exchanges) && isClient) {
      window.localStorage.setItem(KEY_OF_EXCHANGES, exchanges)
    }
  },
  getExchanges: () => {
    if (isClient) {
      let rawStr = window.localStorage.getItem(KEY_OF_EXCHANGES) || ''
      return rawStr.split(',').filter(item => item)
    }
    return []
  },
  setRefreshInterval: (refreshInterval) => {
    if (isClient) {
      window.localStorage.setItem(KEY_OF_REFRESHINTERVAL, refreshInterval)
    }
  },
  getRefreshInterval: () => {
    if (isClient) {
      let interval = parseInt(window.localStorage.getItem(KEY_OF_REFRESHINTERVAL)) || 60
      if (interval < 10) interval = 10
      return interval
    }
    return 60
  }
}
