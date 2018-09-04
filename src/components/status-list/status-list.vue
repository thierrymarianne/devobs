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
        <template v-if='visibleAggregateHasStatuses'>
          <div
            :data-index='status.key'
            :data-status-id='status.statusId'
            :key='status.statusId'
            class='status-list__item'
            v-show='isAggregateVisible(aggregateType.name)'
            v-for='status in visibleStatuses.statuses'
          >
            <status v-if='!status.conversation' :status-at-first='status' />
            <conversation 
              v-else-if='isAggregateVisible("bucket")'
              :originates-from='status'
              :statuses='status.conversation' 
            />
          </div>
        </template>
        <div
          v-else
          class='status-list__item-none'
        >{{ emptyAggregateText(aggregateType) }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapActions, mapGetters, mapMutations } = createNamespacedHelpers('bucket');

import ApiMixin  from '../../mixins/api';
import StatusFormat  from '../../mixins/status-format';
import EventHub from '../../modules/event-hub';
import Status from '../status/status.vue';
import Conversation from '../conversation/conversation.vue';
import SharedState from '../../modules/shared-state';
import ActionTypes from '../../store/bucket-action-types';

export default {
  components: {
    Conversation,
    Status
  },
  mixins: [ApiMixin, StatusFormat],
  name: 'status-list',
  created: function () {
    this.aggregateTypes = this.declareAggregateTypesFromRoutes(this.routes);
    this.refreshBucket();

    this.getStatuses({ aggregateType: 'pressReview' });
  },
  computed: {
    visibleAggregateHasStatuses: function () {
      return this.aggregateTypes[this.visibleStatuses.name]
      .statuses.length > 0;
    }
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_REMOVAL_FROM_BUCKET,
      ActionTypes.RESTORE_BUCKET_FROM_PERSISTENCE_LAYER,
    ]),
    ...mapGetters([
      'getStatusesInBucket',
      'isInBucket',
    ]),
    emptyAggregateText: function (aggregateType) {
      if (this.isAggregateVisible('bucket')) {
        return 'Your private bucket is empty.';
      }

        return 'Hum... Nothing has been collected yet for this list. Something SHALL be wrong - See RFC 2119).';
    },
    refreshBucket: function () {
      const statusesInBucket = this.getStatusesInBucket();
      let statusCollection = this.getCollectionOfStatusesInBucket(statusesInBucket);

      const visitingBucket = this.visibleStatuses.name === 'bucket';
      if (visitingBucket) {
        statusCollection = this.expandConversations(statusCollection);
      }

      this.aggregateTypes.bucket = {
        statuses: statusCollection,
        isVisible: false,
        name: 'bucket',
      };

      if (visitingBucket) {
        this.visibleStatuses.statuses = statusCollection;
      }
    },
    getCollectionOfStatusesInBucket: function (statuses) {
      if (statuses === undefined) {
        return [];
      }

      return Object.values(statuses);
    },
    listClasses: function (aggregateType) {
      const classNames = {
         'status-list__list': true
      }; 

      if (this.isAggregateVisible(aggregateType)) {
        classNames['status-list__list--full-width'] = true;
      }
      
      if ((this.visibleStatuses.name === 'bucket')
      && (Object.keys(this.visibleStatuses.statuses).length === 0)) {
        classNames['status-list__empty-bucket'] = true;
      }

      if ((this.visibleStatuses.name !== 'bucket')
      && (Object.keys(this.visibleStatuses.statuses).length === 0)) {
        classNames['status-list__empty-list'] = true;
      }

      return classNames;
    },
    switchBetweenVisibleStatuses: function (aggregateType, statuses) {
      Object.keys(this.aggregateTypes).map((aggregateType) => {
        this.aggregateTypes[aggregateType].isVisible = false
      });
      this.aggregateTypes[aggregateType].isVisible = true

      statuses.statuses = Object.assign({}, this.aggregateTypes[aggregateType].statuses);
      statuses.name = aggregateType;      

      return statuses;
    },
    getStatuses: function ({ aggregateType, bustCache }) {
      let shouldBustCache = false;
      if ((typeof bustCache !== 'undefined') && (aggregateType !== 'bucket')) {
        shouldBustCache = bustCache;
      }

      if (this.shouldGuardAgainstUndefinedRoute()) {
        return;
      }

      this.state.fetchedLatestStatusesOfAggregate = aggregateType;

      if (!shouldBustCache
      && (aggregateType === 'bucket')
        || (this.aggregateTypes[aggregateType].statuses.length > 0)) {
        this.switchBetweenVisibleStatuses(aggregateType, this.visibleStatuses);
        return;
      }

      const route = `${this.routes[aggregateType]}${this.getTimestampSuffix()}`;
      const authenticationToken = localStorage.getItem('x-auth-token');

      this.replaceBucketFromPersistentLayer();

      this.$http.get(
        route, {
          headers: { 'x-auth-token': authenticationToken }
        }
      )
      .then((response) => {
        this.statuses = null;
        try {
          this.aggregateTypes[aggregateType].statuses = this.formatStatuses(response.data);
        } catch (error) {
          this.logger.error(error.message, 'status-list');
          return;
        }

        this.switchBetweenVisibleStatuses(aggregateType, this.visibleStatuses);
        EventHub.$emit('status_list.after_fetch');
      })
      .catch(e => this.logger.error(e.message, 'status-list', e))
    },
    getTimestampSuffix: function () {
      const timestamp = (new Date()).getTime();
      let timestampSuffix = '';
      if (!this.environment.productionMode) {
        let timestampSuffix = `?${timestamp}`;
      }

      return timestampSuffix;      
    },
    isAggregateVisible: function (aggregateType) {
      return aggregateType === this.visibleStatuses.name;
    },
    shouldGuardAgainstUndefinedRoute: function () {
      typeof this.routes === 'undefined';
    },
    addToBucket: function ({ status }) {
      this.persistAdditionToBucket(status);
      this.refreshBucket();
    },
    removeFromBucket: function ({ status }) {
      this.persistRemovalFromBucket(status);
      this.refreshBucket();
    }
  },
  mounted: function () {
    EventHub.$on('status_list.reload_intended', this.getStatuses);
    EventHub.$on('status_list.intent_to_refresh_bucket', this.refreshBucket);
    EventHub.$on('status.added_to_bucket', this.addToBucket);
    EventHub.$on('status.removed_from_bucket', this.removeFromBucket);
  },
  data: function () {
    return {
      aggregateTypes: {},
      state: SharedState.state,
      visibleStatuses: SharedState.state.visibleStatuses,
      errors: [],
      errorMessages: SharedState.errors,
      logger: SharedState.logger,
      logLevel: SharedState.logLevel,
      environment: SharedState.getEnvironmentParameters(),
    };
  },
}
</script>

<style scoped>
@import './status-list.scss';
</style>