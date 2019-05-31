<template>
  <div class="keyword-list list">
    <date-interval
      ref="date-interval"
      :start-date="startDate"
      :end-date="endDate"
      :max-start-date="startDate"
      :min-end-date="minEndDate"
      :max-date="maxDate"
      :min-date="minDate"
      :show-end-date="true"
      namespace="keyword_list"
    />
    <wordcloud
      :color="colors"
      :data="items"
      :rotate="wordRotation"
      :show-tooltip="false"
      :word-click="wordClickHandler"
      font-scale="log"
      name-key="term"
      spiral="rectangular"
      value-key="occurrences" />
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
// @see https://github.com/feifang/vue-wordcloud
// @see https://github.com/jasondavies/d3-cloud
import wordcloud from 'vue-wordcloud';

import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import ApiMixin from '../../mixins/api';
import Config from '../../config';
import DateInterval from '../date-interval/date-interval.vue';
import DateMixin from '../../mixins/date';
import SharedState from '../../modules/shared-state';
import Status from '../status/status.vue';
import StatusFormat from '../../mixins/status-format';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

const RETWEETS_INCLUDED = '1';

export default {
  name: 'keyword-list',
  components: {
    DateInterval,
    Status,
    wordcloud
  },
  mixins: [ApiMixin, AuthenticationHeadersMixin, DateMixin, StatusFormat],
  data() {
    let { startDate, endDate } = this.$route.params;

    if (startDate === '1970-01-01') {
      startDate = this.getCurrentDate();
    }

    if (endDate === '1970-01-01') {
      endDate = this.getCurrentDate();
    }

    return {
      aggregates: [],
      colors: ['#1f77b4', '#629fc9', '#94bedb', '#c9e0ef'],
      endDate,
      highlights: [],
      // Included retweets by default when fetching highlights
      includeRetweets: RETWEETS_INCLUDED,
      items: [],
      logger: SharedState.logger,
      pageIndex: 1,
      selectedAggregates: [],
      totalPages: null,
      maxDate: this.getCurrentDate(),
      minDate: '2018-01-01',
      startDate,
      wordRotation: {
        from: 0,
        to: 0
      }
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    })
  },
  mounted() {
    if (!this.isAuthenticated) {
      return;
    }

    this.$refs['date-interval'].$on(
      'date_interval.keyword_list',
      this.fetchListFromDateInterval
    );
  },
  methods: {
    fetchListFromDateInterval(event) {
      const { startDate, endDate } = event;

      this.startDate = startDate;
      this.endDate = endDate;

      this.fetchList();
    },
    fetchList(params = {}, next) {
      const requestOptions = this.setUpCommonHeaders();

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

      requestOptions.params = {
        startDate: this.startDate,
        endDate: this.endDate
      };

      requestOptions.params.pageSize = this.pageSize;

      const action = this.routes.actions.fetchKeywords;
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
    },
    fetchHighlights(params = {}) {
      return new Promise(resolve => {
        const authenticationToken = localStorage.getItem('x-auth-token');
        const requestOptions = {
          headers: { 'x-auth-token': authenticationToken }
        };

        const headerName = Object.keys(requestOptions.headers)[0];
        this.$http.defaults.headers.common[headerName] =
          requestOptions.headers[headerName];

        requestOptions.params = {
          term: params.term,
          startDate: this.startDate,
          endDate: this.endDate,
          routeName: this.$route.name
        };

        if (this.pageSize > 0) {
          requestOptions.params.pageSize = this.pageSize;
        }

        requestOptions.params.includeRetweets = 0;
        if (this.includeRetweets === RETWEETS_INCLUDED) {
          requestOptions.params.includeRetweets = 1;
        }

        if (this.selectedAggregates.length > 0) {
          requestOptions.params.selectedAggregates = this.selectedAggregates;
        }

        const action = this.routes.actions.fetchHighlights;
        const route = `${Config.getSchemeAndHost()}${action.route}`;

        requestOptions.headers['x-auth-admin-token'] = this.idToken;
        this.$http[action.method](route, requestOptions)
          .then(response => {
            if (response.data.aggregates) {
              this.aggregates = response.data.aggregates;
            }

            this.pageIndex = parseInt(response.headers['x-page-index'], 10);
            this.totalPages = parseInt(response.headers['x-total-pages'], 10);

            resolve(response.data);
          })
          .catch(e => {
            this.logger.error(e.message, 'keyword-list.highlight', e);
          });
      });
    },
    wordClickHandler(name) {
      this.fetchHighlights({ term: name }).then(highlights => {
        if (highlights.statuses) {
          this.highlights = highlights.statuses;
          return;
        }

        this.highlights = [];
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './keyword-list.scss';
</style>
