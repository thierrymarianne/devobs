<template>
  <div class='status-list'>
    <transition-group
      name='custom-classes-transition'
      enter-active-class='animated slideInLeft'
      leave-active-class='animated slideInLeft'
      tag='div'
    >
      <div 
        :class='listClasses(aggregateType.name)'
        :key='aggregateType.name'
        :data-key='aggregateType.name'
        v-for='aggregateType in aggregateTypes'
      >
        <div 
          :data-key='status.key'
          :key='status.key'
          class='status-list__item'
          v-show='isAggregateVisible(aggregateType.name)'
          v-for='status in visibleStatuses.statuses'
        >
            <status :status='status' />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';
import EventHub from '../../modules/event-hub';
import Status from '../status/status.vue';
import SharedState from '../../modules/shared-state';

export default {
  components: {
    Status
  },
  mixins: [ApiMixin],
  name: 'status-list',
  created: function () {
    this.getStatuses({ aggregateType: SharedState.state.defaultAggregate });
  },
  methods: {
    listClasses: function (aggregateType) {
      const classNames = {
         'status-list__list': true
      }; 

      if (this.isAggregateVisible(aggregateType)) {
        classNames['status-list__list--full-width'] = true;
      }
      
      return classNames;
    },
    formatStatuses: function (statuses) {

      if (typeof statuses === 'undefined' || statuses === null) {
        return [];
      }

      let formattedStatuses = [];

      if (typeof statuses.forEach !== 'function') {
        throw Error('Empty aggregate');
      }

      statuses.forEach((status) => {
        let links = status.text.match(/http(?:s)?:\/\/\S+/g);

        if (links === null || links === undefined || links.length <= 1) {
          links = [];
        }

        formattedStatuses.push({
          username: status.username,
          avatarUrl: status.avatar_url,
          publishedAt: new Date(status.published_at),
          statusId: status.status_id,
          text: this.parseFromString(status.text),
          url: status.url,
          isVisible: false,
          links
        });
      });

      formattedStatuses = formattedStatuses.sort(this.sortByPublicationDate);
      formattedStatuses = formattedStatuses.reduce((statuses, status) => {
        statuses.indexOf(status)
        statuses[statuses.indexOf(status)].key = statuses.indexOf(status);
        return statuses;
      },  formattedStatuses);

      return formattedStatuses;
    },
    getStatuses: function ({ aggregateType }) {
      const timestamp = (new Date()).getTime();
      let timestampSuffix = '';

      if (!this.state.productionMode) {
        let timestampSuffix = `?${timestamp}`;
        console.log(`${this.routes[aggregateType]}${timestampSuffix}`);
      }

      if (typeof this.routes === 'undefined') {
        return;
      }

      this.state.fetchedLatestStatusesOfAggregate = aggregateType;

      if (this.aggregateTypes[aggregateType].statuses.length > 0) {
        Object.keys(this.aggregateTypes).map((aggregateType) => {
          this.aggregateTypes[aggregateType].isVisible = false
        });
        this.aggregateTypes[aggregateType].isVisible = true
        this.visibleStatuses.statuses = Object.assign({}, this.aggregateTypes[aggregateType].statuses);
        this.visibleStatuses.name = aggregateType;
        return;
      }

      const route = `${this.routes[aggregateType]}${timestampSuffix}`;
      const authenticationToken = localStorage.getItem('x-auth-token');

      // Experimenting with fetch
      if (this.state.useFetch) {
        const headers = new Headers();
        headers.append(
          'x-auth-token',
          authenticationToken
        );
        const requestParams = { 
          method: 'GET',
          headers: headers,
          mode: 'cors',
          cache: 'default' 
        };

        const request = new Request(route, requestParams);

        fetch(request).then((response) => {
          console.log(response);
        }).catch(error => console.error(error));
      }

      this.$http.get(
        route, { headers: { 'x-auth-token': authenticationToken } }
      )
      .then(response => {
        this.statuses = null;
        this.aggregateTypes[aggregateType].statuses = this.formatStatuses(response.data);

        Object.keys(this.aggregateTypes).map((aggregateType) => {
          this.aggregateTypes[aggregateType].isVisible = false
        });
        this.aggregateTypes[aggregateType].isVisible = true
        this.visibleStatuses.statuses = Object.assign({}, this.aggregateTypes[aggregateType].statuses);
        this.visibleStatuses.name = aggregateType;
      })
      .catch(e => {
        console.error(e);
        this.errors.push(e)
      })
    },
    isAggregateVisible: function (aggregateType) {
      return aggregateType === this.visibleStatuses.name;
    },
    sortByPublicationDate: function (statusA, statusB) {
      if (statusA.publishedAt === statusB.publishedAt) {
        return 0;
      }

      if (statusA.publishedAt > statusB.publishedAt) {
        return -1;
      }

      return 1;
    },
    // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
    parseFromString: function (subject) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(
          '<!doctype html><body>' + subject,
          'text/html');
      return dom.body.textContent;
    },
  },
  mounted: function () {
    EventHub.$on('status_list.reload_intended', this.getStatuses)
  },
  data: function () {
    return {
      aggregateTypes: {
        defaultAggregate: {
          statuses: [],
          isVisible: false,
          name: 'defaultAggregate',
        },
        pressReview: {
          statuses: [],
          isVisible: false,
          name: 'pressReview',
        },
        clojure: {
          statuses: [],
          isVisible: false,
          name: 'clojure',
        },
        golang: {
          statuses: [],
          isVisible: false,
          name: 'golang',
        },
        php: {
          statuses: [],
          isVisible: false,
          name: 'php',
        },
        javascript: {
          statuses: [],
          isVisible: false,
          name: 'javascript',
        },
        python: {
          statuses: [],
          isVisible: false,
          name: 'python',
        },
        rust: {
          statuses: [],
          isVisible: false,
          name: 'rust',
        },
        scala: {
          statuses: [],
          isVisible: false,
          name: 'scala',
        },
        vueJs: {
          statuses: [],
          isVisible: false,
          name: 'vueJs',
        },
      },
      state: SharedState.state,
      visibleStatuses: SharedState.state.visibleStatuses,
      errors: [],
    };
  },
}
</script>

<style scoped>
@import './status-list.scss';
</style>