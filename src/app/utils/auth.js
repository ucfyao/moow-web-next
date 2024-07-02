/**
 * Created by wainguo on 18/8/8.
 */
import Cookie from 'js-cookie'
const KEY_OF_LOCALE = 'locale'
const KEY_OF_USER = 'user'
const KEY_OF_TOKEN = 'token'

const KEY_OF_PERMISSION = 'permission'
const KEY_OF_SYMBOLS = 'symbols'
const KEY_OF_EXCHANGES = 'exchanges'
const KEY_OF_REFRESHINTERVAL = 'refreshinterval'
const KEY_OF_ISAUTHENTICATED = 'is-authenticated'

export default {
  getLocale: () => {
    return window.localStorage.getItem(KEY_OF_LOCALE) || 'en';
  },
  setLocale: (locale) => {
    window.localStorage.setItem(KEY_OF_LOCALE, locale);
    Cookie.set(KEY_OF_LOCALE, locale)
  },
  login: (loginData) => {
    if (typeof loginData === 'object') {
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
      window.localStorage.setItem(KEY_OF_ISAUTHENTICATED, true);
      return true
    }
    return false
  },
  logout: () => {
    window.localStorage.removeItem(KEY_OF_USER)
    window.localStorage.removeItem(KEY_OF_TOKEN)

    window.localStorage.removeItem(KEY_OF_PERMISSION)
    window.localStorage.removeItem(KEY_OF_ISAUTHENTICATED)
  },

  isAuthenticated: function() {
    return window.localStorage.getItem(KEY_OF_ISAUTHENTICATED) === 'true'
  },

  getToken: () => {
    return window.localStorage.getItem(KEY_OF_TOKEN)
  },

  getUser: () => {
    let user = null
    try {
      let rawdata = window.localStorage.getItem(KEY_OF_USER)
      user = JSON.parse(rawdata)
    } catch (error) {
      console.log(error)
    }
    return user
  },

  hasPermission: (code) => {
    let permission = {}
    try {
      let rawdata = window.localStorage.getItem(KEY_OF_PERMISSION)
      permission = JSON.parse(rawdata) || {}
    } catch (error) {
      console.log(error)
    }

    return permission[code]
  },

  setAsLoggedOut: () => {
    window.localStorage.setItem(KEY_OF_ISAUTHENTICATED, false)
  },


  setSymbols: (symbols) => {
    if (!Array.isArray(symbols)) return;
    window.localStorage.setItem(KEY_OF_SYMBOLS, symbols)
  },
  getSymbols: () => {
    let rawStr = window.localStorage.getItem(KEY_OF_SYMBOLS) || ''
    return rawStr.split(',').filter(item => item)
  },

  setExchanges: (exchanges) => {
    if (!Array.isArray(exchanges)) return;
    window.localStorage.setItem(KEY_OF_EXCHANGES, exchanges)
  },
  getExchanges: () => {
    let rawStr = window.localStorage.getItem(KEY_OF_EXCHANGES) || ''
    return rawStr.split(',').filter(item => item)
  },

  setRefreshInterval: (refreshInterval) => {
    window.localStorage.setItem(KEY_OF_REFRESHINTERVAL, refreshInterval)
  },
  getRefreshInterval: () => {
    let interval = parseInt(window.localStorage.getItem(KEY_OF_REFRESHINTERVAL)) || 60
    if (interval < 10) interval = 10
    return interval
  }
}