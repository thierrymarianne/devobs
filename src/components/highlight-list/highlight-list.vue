<template>
  <div :class='highlightsClasses'>
    <div class="highlight-list__buttons">
      <label
        :class="{ 'highlight-list__dates': showEndDate }"
        for="start-date"
      >
        <input
          id="start-date"
          v-model="startDate"
          :min="minDate"
          :max="maxStartDate"
          type="date"
        >
        <input
          v-if="showEndDate"
          id="end-date"
          v-model="endDate"
          :min="minEndDate"
          :max="maxDate"
          type="date"
        >
        <input
          v-else
          v-model="startDate"
          :min="minEndDate"
          :max="maxDate"
          type="hidden"
        >
      </label>
      <div
        v-if="canIdentifyRetweets"
        class="highlight-list__retweets"
      >
        <span class="highlight-list__retweets-label">
          Retweets are
        </span>
        <label
          for="included-retweets"
          title="Include or exclude retweets">
          <input
            id="included-retweets"
            v-model="includeRetweets"
            name="retweets"
            type="radio"
            value="1"
          >{{ includedRetweetsLabel }}
        </label>
        <label
          for="excluded-retweets"
          title="Include or exclude retweets">
          <input
            id="excluded-retweets"
            v-model="includeRetweets"
            type="radio"
            name="retweets"
            value="0"
          >{{ excludedRetweetsLabel }}
        </label>
      </div>
    </div>
    <label
      v-if="aggregates.length > 0"
      for="select-aggregates">
      Select one or more Twitter accounts to fetch their highlights
      <select
        id="select-aggregates"
        v-model="selectedAggregates"
        name="selected-aggregates"
        multiple="multiple"
        class="list__items highlight-list__aggregates"
        @change="fetchHighlights"
      >
        <option
          v-for="(aggregate) in sortedAggregates"
          :key="aggregate.twitterMemberId"
          :data-key="aggregate.twitterMemberId"
          :value="aggregate.memberId"
          class="list__item"
        >
          @{{ aggregate.memberName }}
          - {{ aggregate.memberFullName }}
          - {{ aggregate.totalHighlights }} statuses
        </option>
      </select>
      <button
        class="highlight-list__clear-selection"
        type="reset"
        value="clear"
        @click="clearAggregateSelection"
      >Clear selection</button>
    </label>
    <ul class="list__items">
      <li
        v-for="(highlight, index) in highlights"
        :key="highlight.statusId"
        :data-key="highlight.statusId"
        class="list__item"
      >
        <status
          :status-at-first="formatStatus(highlight.status)"
          :ref-name="index"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import Config from '../../config';
import DateMixin from '../../mixins/date';
import EventHub from '../../modules/event-hub';
import StatusFormat from '../../mixins/status-format';
import SharedState from '../../modules/shared-state';
import Status from '../status/status.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

const RETWEETS_EXCLUDED = '0';

export default {
  name: 'highlight-list',
  components: { Status },
  mixins: [ApiMixin, DateMixin, StatusFormat],
  data() {
    let defaultDate = this.$route.params.date;
    if (this.$route.params.date === '1970-01-01') {
      defaultDate = this.getMaxDate();
    }

    return {
      includeRetweets: RETWEETS_EXCLUDED,
      aggregates: [],
      items: [],
      logger: SharedState.logger,
      minDate: '2018-01-01',
      maxDate: this.getMaxDate(),
      selectedAggregates: [],
      pageIndex: 1,
      pageSize: 10,
      totalPages: null,
      endDate: defaultDate,
      startDate: defaultDate
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    canIdentifyRetweets() {
      return new Date(this.startDate) >= new Date('2018-12-09');
    },
    highlights() {
      return this.items;
    },
    highlightsClasses() {
      const classes = {
        'highlight-list': true,
        list: true
      };

      if (!this.isAuthenticated) {
        classes['highlight-list--anonymously-visited'] = true;
      }

      return classes;
    },
    includedRetweetsLabel() {
      return 'included';
    },
    excludedRetweetsLabel() {
      return 'excluded';
    },
    maxStartDate() {
      if (new Date(this.maxDate) > new Date(this.endDate)) {
        return this.endDate;
      }

      return this.maxDate;
    },
    minEndDate() {
      if (new Date(this.minDate) > new Date(this.startDate)) {
        return this.minDate;
      }

      return this.startDate;
    },
    showEndDate() {
      return this.$route.name !== 'highlights';
    },
    sortedAggregates() {
      const reversedAggregates = this.aggregates.concat([]);
      return reversedAggregates.reverse();
    }
  },
  watch: {
    startDate() {
      this.updateHighlights();
    },
    endDate() {
      this.updateHighlights();
    },
    includeRetweets() {
      this.updateHighlights();
    }
  },
  destroyed() {
    EventHub.$off('highlight_list.reload_intended');
  },
  created() {
    EventHub.$off('highlight_list.reload_intended');
    EventHub.$on('highlight_list.reload_intended', this.fetchHighlights);

    this.fetchHighlights();
  },
  methods: {
    clearAggregateSelection() {
      this.selectedAggregates = [];
      this.fetchHighlights();
    },
    fetchHighlights(params = {}) {
      return new Promise(resolved => {
        const authenticationToken = localStorage.getItem('x-auth-token');
        const requestOptions = {
          headers: { 'x-auth-token': authenticationToken }
        };

        const headerName = Object.keys(requestOptions.headers)[0];
        this.$http.defaults.headers.common[headerName] =
          requestOptions.headers[headerName];

        requestOptions.params = {
          startDate: this.startDate,
          endDate: this.endDate
        };

        if (!this.showEndDate) {
          requestOptions.params.endDate = this.startDate;
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

        if (this.pageSize > 0) {
          requestOptions.params.pageSize = this.pageSize;
        }

        requestOptions.params.includeRetweets = 1;
        if (this.includeRetweets === RETWEETS_EXCLUDED) {
          requestOptions.params.includeRetweets = 0;
        }

        if (this.$route.name !== 'highlights') {
          requestOptions.params.routeName = this.$route.name;
          requestOptions.headers['x-auth-admin-token'] = this.idToken;
        }

        if (this.selectedAggregates.length > 0) {
          requestOptions.params.selectedAggregates = this.selectedAggregates;
        }

        const action = this.routes.actions.fetchHighlights;
        const route = `${Config.getSchemeAndHost()}${action.route}`;
        this.$http[action.method](route, requestOptions)
          .then(response => {
            this.items = response.data.statuses;

            if (response.data.aggregates) {
              this.aggregates = response.data.aggregates;
            }

            this.totalPages = parseInt(response.headers['x-total-pages'], 10);
            this.pageIndex = parseInt(response.headers['x-page-index'], 10);

            let routeName = 'highlights';
            if (this.$route.name !== 'highlights') {
              routeName = this.$route.name;
            }

            const dateParams = { startDate: this.startDate };
            dateParams.endDate = this.endDate;
            if (!this.showEndDate) {
              dateParams.endDate = this.startDate;
            }

            this.$router.push({
              name: routeName,
              params: dateParams
            });

            resolved(response.data);
          })
          .catch(e => {
            this.logger.error(e.message, 'highlight-list', e);

            if (requestOptions.params.routeName) {
              this.$router.replace({
                name: 'press-review'
              });
            }
          });
      });
    },
    getMaxDate() {
      return this.getCurrentDate();
    },
    getMemberProfileUrl(aggregate) {
      return `https://twitter.com/${aggregate.memberName}`;
    },
    updateHighlights() {
      this.fetchHighlights().then(data => {
        this.items = data.statuses;

        if (data.aggregates) {
          this.aggregates = data.aggregates;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './highlight-list.scss';
</style>
