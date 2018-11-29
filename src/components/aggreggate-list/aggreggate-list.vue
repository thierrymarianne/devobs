<template>
  <div
    v-if="isAuthenticated"
    class="aggregate-list list"
  >
    <div class="list__search">
      <label
        class="list__typeahead-label"
        for="typeahead">
        <font-awesome-icon
          v-if="isSortableByPriority"
          icon="exclamation-triangle"
          class="aggregate-list__button-sort-by-priority"
          @click="sortByPriority"
        />
        <font-awesome-icon
          v-if="canBeRenderedAsAGrid"
          icon="th"
          class="aggregate-list__button-switch-to-grid-view"
          @click="switchToGridView"
        />
        <input
          id="typeahead"
          v-model="keywords"
          class='list__typeahead'
          type="text"
          placeholder="Climate change, Software craftmanship, Lean"
          @keyup.enter="fetchLists"
        >
      </label>
      <input
        class="list__button list__button-search"
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
    <ul :class="listClasses">
      <li
        v-for="(aggregate, index) in filteredItems"
        :key="aggregate.name"
        :data-key="aggregate.name"
        :class="getListItemClasses(aggregate)"
      >
        <aggregate
          :click-handler="goToAggregate"
          :aggregate="aggregate"
          :ref-name="index"
        />
        <!--
      --></li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import NavigationMixin from '../navigation/navigation';
import SharedState from '../../modules/shared-state';
import EventHub from '../../modules/event-hub';
import Config from '../../config';
import Aggregate from '../aggregate/aggregate.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'aggregate-list',
  components: {
    Aggregate
  },
  mixins: [ApiMixin, NavigationMixin],
  props: {
    defaultPageSize: {
      type: Number,
      default: 50
    },
    defaultPageSizeInGridView: {
      type: Number,
      default: 1000
    },
    isSortableByPriority: {
      type: Boolean,
      default: false
    },
    canBeRenderedAsAGrid: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      keywords: null,
      pageIndex: 1,
      pageSize: this.defaultPageSize,
      totalPages: null,
      isGridViewEnabled: !this.canBeRenderedAsAGrid,
      sortedByPriority: !this.isSortableByPriority
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    filteredItems() {
      if (this.sortedByPriority) {
        const sortedByTotalMembers = this.items.sort((a, b) => {
          if (a.totalMembers === b.totalMembers) {
            return 0;
          }

          if (a.totalMembers > b.totalMembers) {
            return 1;
          }

          return -1;
        });

        return sortedByTotalMembers.sort((a, b) => {
          if (a.totalStatuses === b.totalStatuses) {
            return 0;
          }

          if (a.totalStatuses > b.totalStatuses) {
            return 1;
          }

          return -1;
        });
      }

      return this.items;
    },
    listClasses() {
      const classes = { list__items: true };

      if (this.isGridViewEnabled) {
        classes['list__items--grid'] = true;

        return classes;
      }

      return classes;
    }
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
    previousPageExists() {
      return this.pageIndex > 1;
    },
    nextPageExists() {
      return this.totalPages && this.pageIndex < this.totalPages;
    },
    fetchPreviousPage() {
      this.fetchLists({
        pageIndex: this.pageIndex - 1,
        pageSize: this.pageSize
      });
    },
    fetchNextPage() {
      this.fetchLists({
        pageIndex: this.pageIndex + 1,
        pageSize: this.pageSize
      });
    },
    fetchLists(params = {}, next) {
      const requestOptions = {
        headers: {
          'x-auth-admin-token': this.idToken
        }
      };

      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      if (this.keywords) {
        requestOptions.params = {
          keyword: this.keywords
        };
      }

      if (params.pageIndex) {
        if (!('params' in requestOptions)) {
          requestOptions.params = {};
        }

        requestOptions.params.pageIndex = params.pageIndex;
      }

      if (!requestOptions.params) {
        requestOptions.params = {};
      }
      requestOptions.params.pageSize = this.pageSize;

      const action = this.routes.actions.fetchLists;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = response.data;
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);

          if (this.keywords) {
            this.goToRoute({
              routeName: 'searched-lists',
              newParams: { keywords: this.keywords }
            });
          }

          if (typeof next === 'function') {
            next();
          }
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    },
    getListItemClasses(aggregate) {
      const classes = { list__item: true };

      if (aggregate.totalMembers === 0) {
        classes['aggregate-list__aggregate--no-member'] = true;
      }

      if (aggregate.totalStatuses === 0) {
        classes['aggregate-list__aggregate--no-status'] = true;
      }

      return classes;
    },
    goToAggregate(aggregateId) {
      this.$router.push({
        name: 'list',
        params: { aggregateId }
      });

      EventHub.$emit('aggregate.reload_intended');
    },
    sortByPriority() {},
    switchToGridView() {
      this.pageSize = this.defaultPageSizeInGridView;
      if (this.isGridViewEnabled) {
        this.pageSize = this.defaultPageSize;
      }

      this.fetchLists(
        {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        },
        () => {
          this.isGridViewEnabled = !this.isGridViewEnabled;
        }
      );
    }
  }
};
</script>

<style lang='scss' scoped>
@import './aggreggate-list.scss';
</style>
