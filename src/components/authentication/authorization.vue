<template>
  <div
    v-if="isAuthenticated"
    class="authorization"
  >
    <button
      v-show="isVisible"
      class="authenticator__button authenticator__authorize-button"
      @click="delegateSignIn()"
    >
      <span>Authorize scope</span>
    </button>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import Auth0Lock from 'auth0-lock';
import AuthenticationMutations from '../../store/authentication-mutations';
import Config from '../../config';
import SharedState from '../../modules/shared-state';
import EventHub from '../../modules/event-hub';

const { mapMutations: mapAuthenticationMutations } = createNamespacedHelpers(
  'authentication'
);

// @see https://auth0.com/docs/quickstart/spa/vuejs/01-login#configure-auth0
export default {
  name: 'authorization',
  mixins: [ApiMixin],
  props: {
    accessToken: {
      type: String,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    idToken: {
      type: String,
      required: true
    },
    isAuthenticated: {
      type: Boolean,
      required: true
    },
    authenticationService: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      authorizationService: {},
      logger: SharedState.logger
    };
  },
  created() {
    this.configureAuthorizationService();

    EventHub.$on('authentication.changed', ({ authenticated, accessToken }) => {
      if (authenticated) {
        this.delegateSignIn(accessToken);
      }
    });
  },
  methods: {
    ...mapAuthenticationMutations([
      AuthenticationMutations.SET_PROFILE,
      AuthenticationMutations.SET_GRANTED_ROUTES,
      AuthenticationMutations.UNSET_PROFILE
    ]),
    configureAuthorizationService() {
      this.authorizationService = new Auth0Lock(
        Config.authentication.auth0.clientId,
        Config.authentication.auth0.host,
        {
          autoclose: true,
          auth: {
            audience: Config.authentication.auth0.audience,
            responseType: 'token id_token',
            params: {
              scope: 'openid profile email read:messages'
            }
          }
        }
      );
      this.authorizationService.on('authenticated', this.setSession);
      this.authorizationService.on('authorization_error', error =>
        this.logger.error(error)
      );

      return this.authorizationService;
    },
    getProfile(cb) {
      if (this.accessToken.length < 1) {
        return;
      }

      this.authorizationService.getUserInfo(
        this.accessToken,
        (err, profile) => {
          if (profile) {
            const requestOptions = {
              headers: {
                'x-auth-admin-token': this.idToken
              }
            };

            const headerName = Object.keys(requestOptions.headers)[0];
            this.$http.defaults.headers.common[headerName] =
              requestOptions.headers[headerName];

            const action = this.routes.actions.fetchMemberProfile;
            const route = `${Config.getSchemeAndHost()}${action.route}`;
            this.$http[action.method](route, requestOptions)
              .then(response => {
                const memberProfile = profile;
                memberProfile.username = response.data.username;
                this.setProfile(memberProfile);
                this.setGrantedRoutes(response.data.grantedRoutes);
              })
              .catch(e => this.logger.error(e.message, 'status-list', e));
          }

          cb(err, profile);
        }
      );
    },
    delegateSignIn() {
      this.authenticationService.checkSession(
        {
          audience: Config.authentication.auth0.audience,
          scope: 'openid profile email read:messages'
        },
        (err, authResult) => {
          if (err) {
            this.logger.error(err);

            return;
          }

          this.setSession(authResult);
        }
      );
    },
    delegateLogOut() {
      this.unsetProfile();
    },
    setSession(authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.getProfile(err => {
          if (err) {
            this.logger.error(err);
          }
        });
      }
    }
  }
};
</script>

<style lang='scss' scoped>
@import './authorization.scss';
</style>
