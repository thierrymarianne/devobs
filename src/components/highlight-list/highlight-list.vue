<template>
  <div :class='highlightsClasses'>
    <label for="date">
      <input
        id="date"
        v-model="defaultDate"
        :min="minDate"
        :max="maxDate"
        type="date"
      >
    </label>
    <ul class="list__items">
      <li
        v-for="(highlight, index) in items"
        :key="highlight.statusId"
        :data-key="highlight.statusId"
        class="list__item"
      >
        <status
          :status-at-first="formatStatus(highlight.status)"
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
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import StatusFormat from '../../mixins/status-format';
import SharedState from '../../modules/shared-state';
import Status from '../status/status.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'highlight-list',
  components: { Status },
  mixins: [ApiMixin, StatusFormat],
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      minDate: '2018-01-01',
      maxDate: this.getMaxDate(),
      pageIndex: 1,
      pageSize: 10,
      totalPages: null,
      defaultDate: this.$route.params.date
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    highlightsClasses() {
      const classes = {
        'highlight-list': true,
        list: true
      };

      if (!this.isAuthenticated) {
        classes['highlight-list--anonymously-visited'] = true;
      }

      return classes;
    }
  },
  watch: {
    defaultDate() {
      this.fetchHighlights().then(items => {
        this.items = items;
      });
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
    fetchHighlights(params = {}) {
      return new Promise((resolved, rejected) => {
        const authenticationToken = localStorage.getItem('x-auth-token');
        const requestOptions = {
          headers: { 'x-auth-token': authenticationToken }
        };

        const headerName = Object.keys(requestOptions.headers)[0];
        this.$http.defaults.headers.common[headerName] =
          requestOptions.headers[headerName];

        requestOptions.params = {
          date: this.defaultDate
        };

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

        const action = this.routes.actions.fetchHighlights;
        const route = `${Config.getSchemeAndHost()}${action.route}`;
        this.$http[action.method](route, requestOptions)
          .then(response => {
            this.items = response.data;
            this.totalPages = parseInt(response.headers['x-total-pages'], 10);
            this.pageIndex = parseInt(response.headers['x-page-index'], 10);

            this.$router.push({
              name: 'highlights',
              params: { date: this.defaultDate }
            });

            resolved(response.data);
          })
          .catch(e => {
            this.logger.error(e.message, 'highlight-list', e);
            rejected(e);
          });
      });
    },
    getMaxDate() {
      const today = new Date();
      today.setDate(today.getDate() - 1);

      let day = today.getDate();
      if (today.getDate() < 10) {
        day = `0${day}`;
      }

      return `${today.getFullYear()}-${today.getMonth() + 1}-${day}`;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './highlight-list.scss';
</style>
