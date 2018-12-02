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
        v-for="(member, index) in items"
        :key="member.name"
        :data-key="member.name"
        class="list__item"
      >
        <a
          :href="getMemberProfileUrl(member.name)"
          target="_blank"
          class="member-list__button-navigate-to-twitter"
        >
          <font-awesome-icon
            :icon="['fab', 'twitter']"
          />
        </a>
        <span
          @click="goToMember(member.name)"
        >
          @{{ format(member.name) }}
        </span>
        <span class="member-list__total-statuses">
          ({{ formatTotalStatuses(member) }})
        </span>
        <font-awesome-icon
          v-if="member.locked"
          icon="lock"
          class="member-list__button-unlock-aggregate"
          @click="unlockAggregate(member, index)"
        />
        <font-awesome-icon
          v-if="canCollectionBeRequested"
          icon="file-download"
          class="member-list__button-collect-status"
          @click="requestStatusCollection(member.name)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import StatusMixin from '../status/status-mixin';
import SharedState from '../../modules/shared-state';
import EventHub from '../../modules/event-hub';
import Config from '../../config';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-list',
  mixins: [ApiMixin, StatusMixin],
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
    canCollectionBeRequested() {
      return !SharedState.getEnvironmentParameters().productionMode;
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
    getBaseRequestOptions() {
      return {
        headers: {
          'x-auth-admin-token': this.idToken
        }
      };
    },
    getMemberProfileUrl(memberName) {
      return `http://twitter.com/${memberName}`;
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
    goToMember(memberName) {
      this.$router.push({
        name: 'member',
        params: {
          memberName,
          aggregateId: this.$route.params.aggregateId
        }
      });

      EventHub.$emit('member_status.reload_intended');
    },
    goToParent() {
      this.$router.push({
        name: 'lists'
      });

      EventHub.$emit('aggregate_list.reload_intended');
    },
    requestStatusCollection(memberName) {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      requestOptions.params = {
        aggregateId: this.$route.params.aggregateId,
        memberName
      };

      const action = this.routes.actions.requestStatusCollection;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.logger.info(response);
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    },
    unlockAggregate(member, index) {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      requestOptions.params = {
        aggregateId: this.$route.params.aggregateId,
        memberName: member.name
      };

      const action = this.routes.actions.unlockAggregate;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.logger.info(response);
          this.items[index].locked = false;
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    }
  }
};
</script>

<style lang='scss' scoped>
@import './member-list.scss';
</style>
