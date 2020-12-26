<template>
  <div :class='highlightsClasses'>
    <link rel="preconnect" :href="getApiHost" />
    <link rel="preconnect" href="https://pbs.twimg.com/" crossorigin />
    <intro />
    <div :class="containerClass">
      <div class="highlight-list__buttons">
        <label
          :class="{ 'highlight-list__dates': showEndDate }"
          for="start-date"
        >
          <span class="highlight-list__date-label">Sélectionner une date :</span>
          <input
            id="start-date"
            ref="startDate"
            v-model="startDate"
            :min="minDate"
            :max="maxStartDate"
            type="date"
          >
          <input
            v-model="startDate"
            :min="minEndDate"
            :max="maxDate"
            type="hidden"
          >
        </label>
        <div
          v-if="canIdentifyRetweets"
          v-show="canFilterByRetweet"
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
      <p
        class="highlight-list__loading"
        v-if="$nuxt.isOffline"
      >
        Votre navigateur se trouve actuellement hors-ligne.<br /><br />
        Une connexion internet est requise afin de découvrir les publications populaires.
      </p>
      <p
        class="highlight-list__loading"
        v-else-if="$fetchState.pending"
      >
        Chargement des publications...
      </p>
      <p
        class="highlight-list__empty-list"
        v-else-if="highlights.length === 0"
      >
        Cette date n'est encore associée à aucune publication pour le moment.<br /><br />
        Veuillez svp sélectionner une date antérieure ou alors revenir un plus tard.
      </p>
      <ul v-else class="list__items">
        <li
          v-for="(highlight, index) in highlights"
          :key="highlight.statusId"
          :data-key="highlight.statusId"
          class="list__item"
        >
          <status
            :status-at-first="formatStatus(highlight.status)"
            :show-media="showMedia"
            :ref-name="index"
          />
        </li>
      </ul>
    </div>
    <outro />
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';
import Config from '../../config';
import DateMixin from '../../mixins/date';
import EventHub from '../../modules/event-hub';
import StatusFormat from '../../mixins/status-format';
import SharedState from '../../modules/shared-state';
import Status from '../status/status.vue';
import Intro from '../intro/intro.vue';
import Outro from '../outro/outro.vue';

const RETWEETS_EXCLUDED = '0';

export default {
  name: 'highlight-list',
  components: { Intro, Status, Outro },
  mixins: [ApiMixin, DateMixin, StatusFormat],
  props: {
    showMedia: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let { startDate, endDate } = this.$route.params;

    if (startDate === '1970-01-01') {
      startDate = this.getMaxDate();
    }

    if (endDate === '1970-01-01') {
      endDate = this.getMaxDate();
    }

    return {
      includeRetweets: RETWEETS_EXCLUDED,
      aggregates: [],
      items: [],
      logger: new SharedState.Logger(this.$sentry),
      minDate: '2018-01-01',
      maxDate: this.getMaxDate(),
      selectedAggregates: [],
      pageIndex: 1,
      pageSize: 10,
      totalPages: null,
      endDate,
      startDate
    };
  },
  computed: {
    containerClass() {
      if (this.$nuxt.isOnline && this.highlights.length > 0 || this.$fetchState.pending) {
        return 'highlight-list__container highlight-list__container--filled'
      }

      return 'highlight-list__container'
    },
    getApiHost() {
      return Config.getSchemeAndHost();
    },
    canIdentifyRetweets() {
      return new Date(this.startDate) >= new Date('2018-12-09');
    },
    canFilterByRetweet() {
      return false;
    },
    highlights() {
      return this.items;
    },
    highlightsClasses() {
      return {
        'highlight-list': true,
        list: true
      };
    },
    includedRetweetsLabel() {
      return 'included';
    },
    excludedRetweetsLabel() {
      return 'excluded';
    },
    maxStartDate() {
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
  async fetch() {
    const action = this.getHighlightsAction();
    const route = this.getHighlightsRoute();
    const requestOptions = this.getRequestOptions();

    const url = new URL(route);
    Object.keys(requestOptions.params).map(key =>
      url.searchParams.set(key, requestOptions.params[key])
    );

    const response = await fetch(
      url,
      {
        method: action.method,
        headers: requestOptions.headers
      }
    )
    .then(res => res.json())
    .catch(e => {
      this.logger.error(e.message, 'highlight-list', e);
    });

    this.items = response.statuses;
  },
  methods: {
    getRequestOptions(params = {}) {
      const authenticationToken = localStorage.getItem('x-auth-token');
      const requestOptions = {
        headers: { 'x-auth-token': authenticationToken }
      };

      requestOptions.params = {
        startDate: this.startDate,
        endDate: this.startDate
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

      if (this.selectedAggregates.length > 0) {
        requestOptions.params.selectedAggregates = this.selectedAggregates;
      }

      return requestOptions;
    },
    getHighlightsAction() {
      return this.routes.actions.fetchHighlights;
    },
    getHighlightsRoute() {
      const action = this.getHighlightsAction();
      return `${Config.getSchemeAndHost()}${action.route}`;
    },
    fetchHighlights(params = {}) {
      this.$fetch();
    },
    getMaxDate() {
      return this.getCurrentDate();
    },
    updateHighlights() {
      this.items = [];
      this.$router.push({
        path: `/${this.startDate}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './highlight-list.scss';
</style>
