import ActionTypes from './authentication-actions';
import MutationTypes from './authentication-mutations';

const Authentication = {
  namespaced: true,
  state: {
    accessToken: '',
    isAuthenticated: false,
    idToken: '',
    expirationDate: null,
    profile: {}
  },
  mutations: {
    [MutationTypes.LOG_OUT](state) {
      state.isAuthenticated = false;
    },
    [MutationTypes.SET_ACCESS_TOKEN](state, accessToken) {
      state.accessToken = accessToken;
    },
    [MutationTypes.SET_EXPIRATION_DATE](state, expirationDate) {
      state.expirationDate = expirationDate;
    },
    [MutationTypes.SET_ID_TOKEN](state, idToken) {
      state.idToken = idToken;
    },
    [MutationTypes.SET_PROFILE](state, profile) {
      state.profile = profile;
    },
    [MutationTypes.SIGN_IN](state) {
      state.isAuthenticated = true;
    },
    [MutationTypes.UNSET_ACCESS_TOKEN](state) {
      state.accessToken = null;
    },
    [MutationTypes.UNSET_EXPIRATION_DATE](state) {
      state.expirationDate = null;
    },
    [MutationTypes.UNSET_ID_TOKEN](state) {
      state.idToken = null;
    },
    [MutationTypes.UNSET_PROFILE](state) {
      state.profile = null;
    }
  },
  actions: {
    [ActionTypes.LOG_OUT]({ commit }) {
      commit(MutationTypes.LOG_OUT);
      commit(MutationTypes.UNSET_ACCESS_TOKEN);
      commit(MutationTypes.UNSET_EXPIRATION_DATE);
      commit(MutationTypes.UNSET_ID_TOKEN);
      commit(MutationTypes.UNSET_PROFILE);
    }
  },
  getters: {
    getAccessToken: function(state) {
      return state.accessToken;
    },
    getIdToken: function(state) {
      return state.idToken;
    },
    getProfile: function(state) {
      return state.profile;
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
