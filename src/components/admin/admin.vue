<template>
  <div class="admin">
    <router-view />
    <div v-if="isAdminPanelVisible" class="admin__configuration-panel">
      <button class="admin__button" @click="collectStatusesForAllMemberSubscriptions">
        Collect statuses for all member subscriptions
      </button>
    </div>
    <authenticator v-show="false" ref="authenticator" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import Authenticator from '../authentication/authenticator.vue';
import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import ApiMixin from '../../mixins/api';
import Config from '../../config';
import SharedState from '../../modules/shared-state';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'admin',
  components: { Authenticator },
  mixins: [ApiMixin, AuthenticationHeadersMixin],
  data() {
    return {
      logger: SharedState.logger
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    isAdminPanelVisible() {
      if (!this.isAuthenticated) {
        return false;
      }

      return this.$route.name === 'admin';
    }
  },
  mounted() {
    this.$refs.authenticator.handleAuthentication();
  },
  methods: {
    collectStatusesForAllMemberSubscriptions() {
      const requestOptions = this.setUpCommonHeaders();

      const action = this.routes.actions.requestStatusCollectionForAllMemberSubscriptions;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(() => {})
        .catch(e => this.logger.error(e.message, 'administration', e));
    }
  }
};
</script>

<style scoped lang="scss">
@import './admin.scss';
</style>
