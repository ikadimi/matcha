import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    updated: 0,
    socket: io("http://localhost:3001"),
  },
  mutations: {
    userLoggedIn: (state, payload) => {
      state.logged = 1;
      state.userId = payload
    },
    userLoggedOut (state) {
      state.logged = 0,
      state.userId = null,
      state.updated = 0
    },
    userUpdated: state => {
      state.updated = 1;
    },
    inboxId: (state, payload) => {
      state.user_2 = payload
    },
    LOADER(state, payload) {
      state.loader = payload
    }
  },
  getters: {

  },
  actions: {
    userUpdated: context => {
      context.commit('userUpdated');
    },
    userLoggedIn: (context, payload) => {
      context.commit('userLoggedIn', payload)
    },
    userLoggedOut: (context) => {
      context.commit('userLoggedOut')
    },
    inboxId: (context, payload) => {
      context.commit('inboxId', payload)
    }
  },
})