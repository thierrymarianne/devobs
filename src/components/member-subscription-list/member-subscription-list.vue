<template>
  <div class="member-subscription-list list">
    <select-input
      :options="aggregates"
      v-model="selectedAggregate"
      label="Select members from a list"
      option-text-prop="name"
      option-value-prop="id"
    />
    <pagination-menu
      v-show="isPaginationMenuVisible"
      :is-previous-button-visible="hasPreviousPage"
      :is-next-button-visible="hasNextPage"
      :previous-icons="['fa', 'arrow-circle-left']"
      :next-icons="['fa', 'arrow-circle-right']"
      :go-to-next-page-handler="() => goToNextPage()"
      :go-to-previous-page-handler="() => goToPreviousPage()"
    >
    </pagination-menu>
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
    <pagination-menu
      v-show="isPaginationMenuVisible"
      :is-previous-button-visible="hasPreviousPage"
      :is-next-button-visible="hasNextPage"
      :previous-icons="['fa', 'arrow-circle-left']"
      :next-icons="['fa', 'arrow-circle-right']"
      :go-to-next-page-handler="() => goToNextPage()"
      :go-to-previous-page-handler="() => goToPreviousPage()"
    />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ActionIcon from '../action-icon/action-icon.vue';
import AggregateMixin from '../../mixins/aggregate';
import ApiMixin from '../../mixins/api';
import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import MemberSubscription from '../member-subscription/member-subscription.vue';
import PaginationMenu from '../pagination-menu/pagination-menu.vue';
import SelectInput from '../select-input/select-input.vue';
import SharedState from '../../modules/shared-state';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-subscription-list',
  components: {
    ActionIcon,
    MemberSubscription,
    PaginationMenu,
    SelectInput
  },
  mixins: [ApiMixin, AggregateMixin, AuthenticationHeadersMixin],
  data() {
    return {
      aggregates: [],
      items: [],
      logger: SharedState.logger,
      pageIndex: this.$route.params.pageIndex,
      pageSize: 96,
      selectedAggregate: '',
      totalPages: null
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    hasNextPage() {
      if (this.totalPages === null) {
        return true;
      }

      return this.pageIndex < this.totalPages;
    },
    hasPreviousPage() {
      return this.pageIndex > 1;
    },
    isPaginationMenuVisible() {
      return this.items && this.items.length === this.pageSize;
    }
  },
  watch: {
    isAuthenticated(newAuthenticationStatus) {
      if (!newAuthenticationStatus) {
        return;
      }

      this.fetchList();
    },
    pageIndex() {
      this.fetchList();
    },
    selectedAggregate() {
      this.fetchList();
    }
  },
  created() {
    EventHub.$off('member_subscription_list.reload_intended');
    EventHub.$on('member_subscription_list.reload_intended', this.fetchList);

    if (this.isAuthenticated) {
      this.fetchList();
    }
  },
  methods: {
    fetchList(next) {
      const requestOptions = this.getRequestOptions();

      const action = this.routes.actions.fetchMemberSubscriptions;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          if (
            response.data &&
            typeof response.data.subscriptions !== 'undefined'
          ) {
            this.items = response.data.subscriptions;
            this.aggregates = this.sortAggregates(response.data.aggregates);
          }
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);

          if (typeof next === 'function') {
            next();
          }
        })
        .catch(e => this.logger.error(e.message, 'keyword-list', e));
    },
    getRequestOptions() {
      const requestOptions = this.setUpCommonHeaders();
      if (!('params' in requestOptions)) {
        requestOptions.params = {};
      }

      requestOptions.params.aggregateId = this.selectedAggregate;
      requestOptions.params.pageSize = this.pageSize;
      requestOptions.params.pageIndex = this.$route.params.pageIndex;

      return requestOptions;
    },
    goToPreviousPage() {
      if (this.pageIndex <= 1) {
        return;
      }

      this.pageIndex = this.pageIndex - 1;
      this.$router.push({
        name: 'member-subscriptions',
        params: { pageIndex: this.pageIndex }
      });
    },
    goToNextPage() {
      this.pageIndex = this.pageIndex + 1;
      this.$router.push({
        name: 'member-subscriptions',
        params: { pageIndex: this.pageIndex }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './member-subscription-list.scss';
</style>
