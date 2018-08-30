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
import ApiMixin  from '../../mixins/api';
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
    this.aggregateTypes = this.declareAggregateTypesFromRoutes(this.routes)
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
        throw Error(this.errorMessages.REQUIRED_COLLECTION);
      }

      statuses.forEach((status) => {
        if ((typeof status.text === 'undefined')
          || (typeof status.text.match !== 'function')) {
          return;
        }

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

      if (!this.environment.productionMode) {
        let timestampSuffix = `?${timestamp}`;
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
        }).catch(error => this.logger.error(error));
      }

      this.$http.get(
        route, {
          headers: { 'x-auth-token': authenticationToken },
          onDownloadProgress: function (progressEvent) {
            // TODO Implement a loadin animation
            // console.log(progressEvent);
            // console.log(progressEvent.total);
            // console.log(progressEvent.loaded);
          },
        }
      )
      .then(response => {
        this.statuses = null;
        try {
          this.aggregateTypes[aggregateType].statuses = this.formatStatuses(response.data);
        } catch (error) {
          SharedState.logger.error(error.message, 'status-list');
          return;
        }

        Object.keys(this.aggregateTypes).map((aggregateType) => {
          this.aggregateTypes[aggregateType].isVisible = false
        });
        this.aggregateTypes[aggregateType].isVisible = true
        this.visibleStatuses.statuses = Object.assign({}, this.aggregateTypes[aggregateType].statuses);
        this.visibleStatuses.name = aggregateType;

        EventHub.$emit('status_list.after_fetch');
      })
      .catch(e => this.logger.error.push(e))
    },
    isAggregateVisible: function (aggregateType) {
      return aggregateType === this.visibleStatuses.name;
    },
    sortByPublicationDate: function (statusA, statusB) {
      if (statusA.publishedAt === statusB.publishedAt) {
        return 0;
      }

      if (statusA.publishedAt < statusB.publishedAt) {
        return 1;
      }

      return -1;
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
      aggregateTypes: {},
      state: SharedState.state,
      visibleStatuses: SharedState.state.visibleStatuses,
      errors: [],
      errorMessages: SharedState.errors,
      logLevel: SharedState.logLevel,
      environment: SharedState.getEnvironmentParameters(),
    };
  },
}
</script>

<style scoped>
@import './status-list.scss';
</style>