import Vue from 'vue'
import Vuex from 'vuex'
import auth from '../utils/auth'

Vue.use(Vuex)

function getLoggedUser() {
  return auth.getUser()
}

function isAuthenticated() {
  return auth.isAuthenticated()
}

function getLocale() {
  return auth.getLocale()
}

export default new Vuex.Store({
  state: {
    locales: ['en', 'zh'],
    locale: getLocale(),
    refreshInterval: 60,  // 刷新间隔
    user: getLoggedUser(),
    isAuthenticated: isAuthenticated(),
  },
  mutations: {
    SET_LOCALE(state, locale) {
      state.locale = locale;
    },
    SET_USER(state, user) {
      state.user = user || null

    },
    SET_USER_ACTIVATED(state, activated = true) {
      if (state.user) state.user.isActivated = activated
    },
    SET_ISAUTHENTICATED(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated
    },
    SET_REFRESHINTERVAL(state, refreshInterval) {
      state.refreshInterval = refreshInterval
    }
  },
  actions: {
    SET_LOCALE({commit}, locale) {
      commit('SET_LOCALE', locale)
    },
    SET_USER({commit}, user) {
      commit('SET_USER', user)
    },
    SET_USER_ACTIVATED({commit}, activated = true) {
      commit('SET_USER_ACTIVATED', activated)
    },
    SET_ISAUTHENTICATED({commit}, isAuthenticated) {
      commit('SET_ISAUTHENTICATED', isAuthenticated)
    },
    SET_REFRESHINTERVAL({commit}, refreshInterval) {
      commit('SET_REFRESHINTERVAL', refreshInterval)
    }
  }
})
