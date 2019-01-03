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
    <div class="authenticator__avatar-box">
      <img
        v-if="loggedInMemberAvatar"
        :src="loggedInMemberAvatar"
        class="authenticator__avatar"
        height="50px"
        width="50px"
      >
    </div>
    <authorization
      ref="authorization"
      :access-token="getAccessToken()"
      :id-token="getIdToken()"
      :is-authenticated="isAuthenticated()"
      :authentication-service="authenticationService"
    />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import auth0 from 'auth0-js';
import DateMixin from '../../mixins/date';
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import AuthenticationActions from '../../store/authentication-actions';
import AuthenticationMutations from '../../store/authentication-mutations';
import Authorization from './authorization.vue';

const {
  mapGetters: mapAuthenticationGetters,
  mapActions: mapAuthenticationActions,
  mapMutations: mapAuthenticationMutations
} = createNamespacedHelpers('authentication');

// @see https://auth0.com/docs/quickstart/spa/vuejs/01-login#configure-auth0
export default {
  name: 'authenticator',
  components: { Authorization },
  mixins: [DateMixin],
  data() {
    return {
      authenticationService: {}
    };
  },
  computed: {
    loggedInMemberAvatar() {
      if (this.getProfile()) {
        return this.getProfile().picture;
      }

      return false;
    }
  },
  created() {
    this.configureAuthenticationService();
    this.setSessionFromLocalStorage();
  },
  methods: {
    ...mapAuthenticationActions([AuthenticationActions.LOG_OUT]),
    ...mapAuthenticationGetters({
      isAuthenticated: 'isAuthenticated',
      getAuthenticatedAccessToken: 'getAccessToken',
      getAuthenticatedIdToken: 'getIdToken',
      getProfile: 'getProfile'
    }),
    ...mapAuthenticationMutations([
      AuthenticationMutations.SIGN_IN,
      AuthenticationMutations.SET_EXPIRATION_DATE,
      AuthenticationMutations.SET_ACCESS_TOKEN,
      AuthenticationMutations.SET_ID_TOKEN
    ]),
    configureAuthenticationService() {
      this.authenticationService = new auth0.WebAuth({
        domain: Config.authentication.auth0.host,
        clientID: Config.authentication.auth0.clientId,
        redirectUri: Config.authentication.auth0.redirectUri,
        responseType: 'token id_token',
        scope: 'openid profile email read:messages'
      });
    },
    setSession(authResult) {
      const expiresAt = this.getExpiresAt(authResult);

      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);

      this.signIn();

      this.setAccessToken(authResult.accessToken);
      this.setExpirationDate(expiresAt);
      this.setIdToken(authResult.idToken);

      EventHub.$emit('authentication.changed', {
        authenticated: true,
        accessToken: authResult.accessToken
      });
    },
    getExpiresAt(authResult) {
      if (authResult.expiresIn) {
        return JSON.stringify(
          authResult.expiresIn * 1000 + new Date().getTime()
        );
      }

      if (authResult.expiresAt) {
        const { expiresAt } = authResult.expiresAt;
        return expiresAt;
      }

      return null;
    },
    setSessionFromLocalStorage() {
      if (
        localStorage.getItem('access_token') &&
        localStorage.getItem('id_token') &&
        localStorage.getItem('expires_at')
      ) {
        const authResult = {
          accessToken: localStorage.getItem('access_token'),
          idToken: localStorage.getItem('id_token'),
          expiresAt: localStorage.getItem('expires_at')
        };
        this.setSession(authResult);
      }
    },
    handleAuthentication() {
      const route = {
        name: 'private-highlights',
        params: {
          startDate: this.getCurrentDate(),
          endDate: this.getCurrentDate()
        }
      };

      this.authenticationService.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
        }

        EventHub.$emit('navigate_to_press_review', route);
      });
    },
    getIdToken() {
      if (!this.isAuthenticated()) {
        return '';
      }

      return this.getAuthenticatedIdToken();
    },
    getAccessToken() {
      if (!this.isAuthenticated()) {
        return '';
      }

      return this.getAuthenticatedAccessToken();
    },
    delegateSignIn() {
      if (!this.authenticationService) {
        return;
      }

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

      this.$refs.authorization.delegateLogOut();
    }
  }
};
</script>

<style lang='scss' scoped>
@import './authenticator.scss';
</style>
