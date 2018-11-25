import ActionTypes from './authentication-actions';
import MutationTypes from './authentication-mutations';

const Authentication = {
  namespaced: true,
  state: {
    isAuthenticated: false,
    idToken: null,
    expirationDate: null
  },
  mutations: {
    [MutationTypes.LOG_OUT](state) {
      state.isAuthenticated = false;
    },
    [MutationTypes.SET_EXPIRATION_DATE](state, expirationDate) {
      state.expirationDate = expirationDate;
    },
    [MutationTypes.SET_ID_TOKEN](state, idToken) {
      state.idToken = idToken;
    },
    [MutationTypes.SIGN_IN](state) {
      state.isAuthenticated = true;
    },
    [MutationTypes.UNSET_EXPIRATION_DATE](state) {
      state.expirationDate = null;
    },
    [MutationTypes.UNSET_ID_TOKEN](state) {
      state.idToken = null;
    }
  },
  actions: {
    [ActionTypes.LOG_OUT]({ commit }) {
      commit(MutationTypes.LOG_OUT);
      commit(MutationTypes.UNSET_EXPIRATION_DATE);
      commit(MutationTypes.UNSET_ID_TOKEN);
    }
  },
  getters: {
    getIdToken: function(state) {
      return state.idToken;
    },
    isAuthenticated: function(state) {
      return (
        state.isAuthenticated &&
        state.expirationDate !== null &&
        new Date().getTime() < state.expirationDate
      );
    }
  }
};

export default Authentication;
