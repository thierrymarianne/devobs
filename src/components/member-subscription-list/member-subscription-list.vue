<template>
  <div class="member-subscription-list list">
    <ul class="list__items">
      <li
        v-for="subscription in items"
        :key="subscription.id"
        :data-key="subscription.id"
        class="list__item"
      >
        <member-subscription :subscription="subscription" />
      </li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import ApiMixin from '../../mixins/api';
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';
import MemberSubscription from '../member-subscription/member-subscription.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-subscription-list',
  components: {
    MemberSubscription
  },
  mixins: [ApiMixin, AuthenticationHeadersMixin],
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      pageIndex: 1,
      pageSize: 25,
      totalPages: null
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    })
  },
  watch: {
    isAuthenticated(newAuthenticationStatus) {
      if (!newAuthenticationStatus) {
        return;
      }

      this.fetchList();
    }
  },
  created() {
    EventHub.$off('member_subscription_list.reload_intended');
    EventHub.$on('member_subscription_list.reload_intended', this.fetchList);

    if (this.isAuthenticated) {
      this.fetchList({});
    }
  },
  methods: {
    fetchList(params = {}, next) {
      const requestOptions = this.setUpCommonHeaders();

      if (typeof params.pageIndex === 'undefined') {
        if (!('params' in requestOptions)) {
          requestOptions.params = {};
        }

        requestOptions.params.pageIndex = this.pageIndex;
      }

      requestOptions.params.pageSize = this.pageSize;

      const action = this.routes.actions.fetchMemberSubscriptions;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = response.data;
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);

          if (typeof next === 'function') {
            next();
          }
        })
        .catch(e => this.logger.error(e.message, 'keyword-list', e));
    }
  }
};
</script>

<style lang="scss" scoped>
@import './member-subscription-list.scss';
</style>
