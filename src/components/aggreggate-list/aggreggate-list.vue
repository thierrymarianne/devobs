<template>
  <div
    v-if="isAuthenticated"
    class="aggregate-list list"
  >
    <div class="list__search">
      <label
        class="list__typeahead-label"
        for="typeahead">
        <input
          id="typeahead"
          v-model="keyword"
          class='list__typeahead'
          type="text"
          placeholder="Climate change, Software craftmanship, Lean"
          @keyup.enter="fetchLists"
        >
      </label>
      <input
        class="list__button-search"
        type="button"
        value="Search"
        @click="fetchLists"
      >
      <input
        v-if="previousPageExists()"
        class="list__button"
        type="button"
        value="previous"
        @click="fetchPreviousPage"
      >
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
        v-for="aggregate in items"
        :key="aggregate.name"
        :data-key="aggregate.name"
        class="list__item"
        @click="goToAggregate(aggregate.id)"
      >{{ format(aggregate.name) }}<!--
      --></li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import SharedState from '../../modules/shared-state';
import EventHub from '../../modules/event-hub';
import Config from '../../config';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'aggregate-list',
  mixins: [ApiMixin],
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      keyword: null,
      pageIndex: 1,
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
    EventHub.$off('aggregate_list.reload_intended');
  },
  created() {
    if (!this.isAuthenticated) {
      return;
    }

    EventHub.$off('aggregate_list.reload_intended');
    EventHub.$on('aggregate_list.reload_intended', this.fetchLists);

    this.fetchLists();
  },
  methods: {
    format(subject) {
      const capitalizedSubject = `${subject
        .substring(0, 1)
        .toUpperCase()}${subject.substring(1, subject.length)}`;

      return capitalizedSubject.replace('::', '>');
    },
    previousPageExists() {
      return this.pageIndex > 1;
    },
    nextPageExists() {
      return this.totalPages && this.pageIndex < this.totalPages;
    },
    fetchPreviousPage() {
      this.fetchLists({ pageIndex: this.pageIndex - 1 });
    },
    fetchNextPage() {
      this.fetchLists({ pageIndex: this.pageIndex + 1 });
    },
    fetchLists(params = {}) {
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

      const action = this.routes.actions.fetchLists;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = response.data;
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    },
    goToAggregate(aggregateId) {
      this.$router.push({
        name: 'list',
        params: { aggregateId }
      });

      EventHub.$emit('aggregate.reload_intended');
    }
  }
};
</script>

<style lang='scss' scoped>
@import './aggreggate-list.scss';
</style>
