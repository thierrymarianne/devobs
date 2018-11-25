<template>
  <div class="authenticator">
    <button
      v-if="isAuthenticated()"
      class="authenticator__button authenticator__logout-button"
      @click="delegateLogOut()"
    >
      <span>Log out</span>
    </button>
    <button
      v-else
      class="authenticator__button authenticator__login-button"
      @click="delegateSignIn()"
    >
      <span>Sign in</span>
    </button>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import auth0 from 'auth0-js';
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import AuthenticationActions from '../../store/authentication-actions';
import AuthenticationMutations from '../../store/authentication-mutations';

const {
  mapGetters: mapAuthenticationGetters,
  mapActions: mapAuthenticationActions,
  mapMutations: mapAuthenticationMutations
} = createNamespacedHelpers('authentication');

// @see https://auth0.com/docs/quickstart/spa/vuejs/01-login#configure-auth0
export default {
  name: 'authenticator',
  data() {
    return {
      authenticationService: {}
    };
  },
  created() {
    this.configureAuthenticationService();
  },
  updated() {
    this.configureAuthenticationService();
  },
  methods: {
    ...mapAuthenticationActions([AuthenticationActions.LOG_OUT]),
    ...mapAuthenticationGetters(['isAuthenticated']),
    ...mapAuthenticationMutations([
      AuthenticationMutations.SIGN_IN,
      AuthenticationMutations.SET_EXPIRATION_DATE,
      AuthenticationMutations.SET_ID_TOKEN
    ]),
    configureAuthenticationService() {
      this.authenticationService = new auth0.WebAuth({
        domain: Config.authentication.auth0.host,
        clientID: Config.authentication.auth0.clientId,
        redirectUri: Config.authentication.auth0.redirectUri,
        responseType: 'token id_token',
        scope: 'openid'
      });
    },
    setSession(authResult) {
      const expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );

      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);

      this.signIn();
      this.setExpirationDate(expiresAt);
      this.setIdToken(authResult.idToken);

      EventHub.$emit('authentication.changed', { authenticated: true });
    },
    handleAuthentication() {
      this.authenticationService.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
        }

        EventHub.$emit('navigate_to_homepage');
      });
    },
    getIdToken() {
      if (!this.isAuthenticated()) {
        return null;
      }

      return localStorage.getItem('id_token');
    },
    delegateSignIn() {
      this.authenticationService.authorize();
    },
    delegateLogOut() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      this.logOut();

      EventHub.$emit('authentication.changed', { authenticated: false });
      // @see https://auth0.com/docs/logout#redirect-users-after-logout
      window.location = Config.authentication.auth0.logoutUri;
    }
  }
};
</script>

<style lang='scss' scoped>
@import './authenticator.scss';
</style>
