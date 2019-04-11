import Vuex from 'vuex'
import axios from 'axios'

// const requestGlobal = require('request')
// const request = requestGlobal.defaults({ jar: true })

// const cookieparser = process.server ? require('cookieparser') : undefined

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      // authUSer: null
      authUser: localStorage.getItem('authUser')
    }),
    mutations: {
      SET_USER: function(state, user) {
        state.authUser = user
        if (user) {
          localStorage.setItem('authUser', user)
        } else {
          localStorage.removeItem('authUser')
        }
      }
    },
    actions: {
      nuxtServerInit({ commit }, { req }) {
        if (req.session && req.session.authUser) {
          commit('SET_USER', req.session.authUser)
        }
      },
      async login({ commit }, { email, password }) {
        try {
          const { data } = await axios.post('/api/login', {
            email,
            password
          })
          commit('SET_USER', data)
        } catch (error) {
          if (error.response && error.response.status === 401) {
            throw new Error('Bad credentials')
          }
          throw error
        }
      },
      async logout({ commit }) {
        await axios.post('/api/logout')
        commit('SET_USER', null)
      }
    }
  })
}

export default createStore
