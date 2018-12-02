<template>
  <div
    v-if="isAuthenticated"
    class="member-status-list list"
  >
    <div class="list__search">
      <input
        class="list__button list__button-go-to-parent"
        type="button"
        value="Parent"
        @click="goToParent()"
      >
      <label
        class="list__typeahead-label"
        for="typeahead">
        <input
          id="typeahead"
          v-model="keyword"
          class='list__typeahead'
          type="text"
          placeholder="Keywords in status"
          @keyup.enter="fetchMemberStatuses"
        >
      </label>
      <input
        class="list__button-search"
        type="button"
        value="Search"
        @click="fetchMemberStatuses"
      >
      <input
        v-if="previousPageExists()"
        class="list__button"
        type="button"
        value="previous"
        @click="fetchPreviousPage"
      >
      <label
        for="total-pages"
        class="list__total-pages"
      >
        <span v-show="false">Total pages</span>
        <input
          id="total-pages"
          v-model="pageSize"
          type="number"
        >
      </label>
      <input
        v-if="nextPageExists()"
        class="list__button"
        type="button"
        value="Next"
        @click="fetchNextPage"
      >
    </div>
    <ul class="list__items">
      <li
        v-for="status in items"
        :key="status.statusId"
        :data-key="status.statusId"
        class="list__item"
      >
        <status
          :from-aggregate-type="status.aggregateName"
          :status-at-first="formatStatus(status.status)"
          can-be-shared-at-first
        /><!--
      --></li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import StatusFormat from '../../mixins/status-format';
import SharedState from '../../modules/shared-state';
import EventHub from '../../modules/event-hub';
import Config from '../../config';
import Status from '../status/status.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-status-list',
  components: { Status },
  mixins: [ApiMixin, StatusFormat],
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      keyword: null,
      pageIndex: 1,
      pageSize: 10,
      totalPages: null
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    })
  },
  destroyed() {
    EventHub.$off('member_status.reload_intended');
  },
  created() {
    if (!this.isAuthenticated) {
      return;
    }

    EventHub.$off('member_status.reload_intended');
    EventHub.$on('member_status.reload_intended', this.fetchMemberStatuses);

    this.fetchMemberStatuses();
  },
  methods: {
    previousPageExists() {
      return this.pageIndex > 1;
    },
    nextPageExists() {
      return this.totalPages && this.pageIndex < this.totalPages;
    },
    fetchPreviousPage() {
      this.fetchMemberStatuses({ pageIndex: this.pageIndex - 1 });
    },
    fetchNextPage() {
      this.fetchMemberStatuses({ pageIndex: this.pageIndex + 1 });
    },
    fetchMemberStatuses(params = {}) {
      const requestOptions = {
        headers: {
          'x-auth-admin-token': this.idToken
        }
      };

      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      if (this.keyword) {
        requestOptions.params = {
          keyword: this.keyword
        };
      }

      if (params.pageIndex) {
        if (!('params' in requestOptions)) {
          requestOptions.params = {};
        }

        requestOptions.params.pageIndex = params.pageIndex;
      }

      if (!('params' in requestOptions)) {
        requestOptions.params = {};
      }
      requestOptions.params.memberName = this.$route.params.memberName;

      if (this.pageSize > 0) {
        requestOptions.params.pageSize = this.pageSize;
      }

      const action = this.routes.actions.fetchMemberStatuses;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = response.data;
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);
        })
        .catch(e => this.logger.error(e.message, 'member-status-list', e));
    },
    goToParent() {
      this.$router.push({
        name: 'list',
        params: { aggregateId: this.$route.params.aggregateId }
      });

      EventHub.$emit('aggregate.reload_intended');
    }
  }
};
</script>

<style lang='scss' scoped>
@import './member-status-list.scss';
</style>
