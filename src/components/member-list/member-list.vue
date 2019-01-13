<template>
  <div
    v-if="isAuthenticated"
    class="member-list list"
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
          placeholder="fabpot, dan_abramov, youyuxi"
          @keyup.enter="fetchMembers"
        >
      </label>
      <input
        class="list__button-search"
        type="button"
        value="Search"
        @click="fetchMembers"
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
        value="next"
        @click="fetchNextPage"
      >
    </div>
    <ul class="list__items">
      <li
        v-for="(member, index) in sortedItems"
        :key="member.name"
        :data-key="member.name"
        class="list__item"
      >
        <member
          :member="member"
          :unlock="getMemberUnlockingCapability(index)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import RequestMixin from '../../mixins/request';
import StatusMixin from '../status/status-mixin';
import EventHub from '../../modules/event-hub';
import Config from '../../config';
import Member from '../member/member.vue';
import SharedState from '../../modules/shared-state';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-list',
  components: { Member },
  mixins: [ApiMixin, RequestMixin, StatusMixin],
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      keyword: null,
      pageIndex: 1,
      pageSize: 25,
      totalPages: null
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    sortedItems() {
      const sortedItems = this.items.concat([]);
      return sortedItems.sort((firstItem, secondItem) => {
        if (secondItem.totalStatuses === firstItem.totalStatuses) {
          return 0;
        }

        if (secondItem.totalStatuses > firstItem.totalStatuses) {
          return -1;
        }

        return 1;
      });
    }
  },
  destroyed() {
    EventHub.$off('aggregate.reload_intended');
  },
  created() {
    if (!this.isAuthenticated) {
      return;
    }

    EventHub.$off('aggregate.reload_intended');
    EventHub.$on('aggregate.reload_intended', this.fetchMembers);

    this.fetchMembers();
  },
  methods: {
    previousPageExists() {
      return this.pageIndex > 1;
    },
    nextPageExists() {
      return this.totalPages && this.pageIndex < this.totalPages;
    },
    fetchPreviousPage() {
      this.fetchMembers({ pageIndex: this.pageIndex - 1 });
    },
    fetchNextPage() {
      this.fetchMembers({ pageIndex: this.pageIndex + 1 });
    },
    fetchMembers(params = {}) {
      const requestOptions = this.getBaseRequestOptions();
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
      requestOptions.params.aggregateId = this.$route.params.aggregateId;

      if (this.pageSize > 0) {
        requestOptions.params.pageSize = this.pageSize;
      }

      const action = this.routes.actions.fetchMembers;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = response.data;
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);
        })
        .catch(e => this.logger.error(e.message, 'member-list', e));
    },
    goToParent() {
      this.$router.push({
        name: 'lists'
      });

      EventHub.$emit('aggregate_list.reload_intended');
    },
    getMemberUnlockingCapability(index) {
      return () => {
        this.items[index].locked = false;
      };
    }
  }
};
</script>

<style lang='scss' scoped>
@import './member-list.scss';
</style>
