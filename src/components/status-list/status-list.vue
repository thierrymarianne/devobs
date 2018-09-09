<template>
  <div class="status-list">
    <transition-group
      :class="getTransitionGroupClasses()"
      name="custom-classes-transition"
      enter-active-class=""
      leave-active-class=""
      tag="div"
    >
      <div
        v-for="aggregateType in aggregateTypes"
        :class="listClasses(aggregateType.name)"
        :key="aggregateType.name"
        :data-key="aggregateType.name"
      >
        <template v-if="isStatusListVisible()">
          <div
            v-for="status in visibleStatuses.statuses"
            v-show="isAggregateVisible(aggregateType.name)"
            :data-key="getStatusKey(status, aggregateType)"
            :key="getStatusKey(status, aggregateType)"
            :class="getStatusListItemClass(status)"
          >
            <template v-if="canBeShared()">
              <status
                v-if="canStatusBeShared(status)"
                :from-aggregate-type="aggregateType.name"
                :status-at-first="status"
                can-be-shared-at-first
              />
            </template>
            <status
              v-else-if="isStatusVisible(status)"
              :from-aggregate-type="aggregateType.name"
              :status-at-first="status" />
            <conversation
              v-else
              :originates-from="status"
              :statuses="status.conversation"
            />
          </div>
        </template>
        <p
          v-else-if="isAggregateVisible(aggregateType.name)"
          class="status-list__item-none"
        >{{ emptyAggregateText() }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import { css } from 'emotion';

import ApiMixin from '../../mixins/api';
import StatusFormat from '../../mixins/status-format';
import EventHub from '../../modules/event-hub';
import Status from '../status/status.vue';
import Conversation from '../conversation/conversation.vue';
import SharedState from '../../modules/shared-state';
import ActionTypes from '../../store/bucket-action-types';

const { mapActions, mapGetters } = createNamespacedHelpers('bucket');

export default {
  name: 'status-list',
  components: {
    Conversation,
    Status
  },
  mixins: [ApiMixin, StatusFormat],
  data() {
    return {
      aggregateTypes: {},
      state: SharedState.state,
      visibleStatuses: SharedState.state.visibleStatuses,
      errors: [],
      errorMessages: SharedState.errors,
      logger: SharedState.logger,
      logLevel: SharedState.logLevel,
      environment: SharedState.getEnvironmentParameters(),
      loadingStatuses: SharedState.state.loadingStatuses
    };
  },
  mounted() {
    EventHub.$on('status_list.load_intended', this.showLoadingMessage);
    EventHub.$on('status_list.reload_intended', this.getStatuses);
    EventHub.$on('status_list.intent_to_refresh_bucket', this.refreshBucket);
    EventHub.$on('status_list.after_fetch', this.refreshBucket);
    EventHub.$on('status.added_to_bucket', this.addToBucket);
    EventHub.$on('status.removed_from_bucket', this.removeFromBucket);
  },
  beforeDestroy() {
    EventHub.$off('status_list.load_intended');
    EventHub.$off('status_list.reload_intended');
    EventHub.$off('status_list.intent_to_refresh_bucket');
    EventHub.$off('status_list.after_fetch');
    EventHub.$off('status.added_to_bucket');
    EventHub.$off('status.removed_from_bucket');
  },
  created() {
    this.aggregateTypes = this.declareAggregateTypesFromRoutes(this.routes);

    const noHorizontalOverflow = css`
      overflow-x: hidden;
    `;
    document.body.classList.add(noHorizontalOverflow);

    if (this.$route.name === 'status') {
      const { statusId } = this.$route.params;
      this.getStatuses({
        aggregateType: this.$route.params.aggregateType,
        filter: status => status.statusId === statusId
      });
    }

    if (this.$route.name === 'aggregate') {
      this.getStatuses({ aggregateType: this.$route.params.aggregateType });
    }

    if (this.$route.name === 'press-review') {
      this.getStatuses({ aggregateType: 'press-review' });
    }

    if (this.$route.name === 'bucket') {
      this.replaceBucketFromPersistentLayer();
      this.refreshBucket({ aggregateType: 'bucket' });
      this.getStatuses({ aggregateType: 'bucket' });

      return;
    }

    this.refreshBucket();
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET,
      ActionTypes.PERSIST_REMOVAL_FROM_BUCKET,
      ActionTypes.RESTORE_BUCKET_FROM_PERSISTENCE_LAYER
    ]),
    ...mapGetters(['getStatusesInBucket', 'isInBucket']),
    canBeShared() {
      return this.$route.name === 'status';
    },
    canStatusBeShared(status) {
      if (!this.canBeShared()) {
        return false;
      }

      return status.statusId === this.$route.params.statusId;
    },
    emptyAggregateText() {
      if (this.isAggregateVisible('bucket')) {
        return 'Your private bucket is empty.';
      }

      return 'Your statuses of interest are being loaded.';
    },
    getStatusKey(status, aggregateType) {
      return `${aggregateType.name}:${status.statusId}`;
    },
    isStatusListVisible() {
      const aggregateIndex = this.getAggregateIndex(this.visibleStatuses.name);
      const isStatusListVisible =
        this.aggregateTypes[aggregateIndex].statuses.length > 0 &&
        !this.loadingStatuses;
      debugger;

      return isStatusListVisible;
    },
    isStatusVisible(status) {
      return !status.conversation || this.$route.name !== 'bucket';
    },
    refreshBucket(event) {
      const statusesInBucket = this.getStatusesInBucket();
      let statusCollection = this.getCollectionOfStatusesInBucket(
        statusesInBucket
      );

      const visitingBucket = this.visibleStatuses.name === 'bucket';
      if (visitingBucket) {
        statusCollection = this.expandConversations(statusCollection, event);
      }

      this.aggregateTypes.bucket = {
        statuses: statusCollection,
        isVisible: false,
        name: 'bucket'
      };

      if (visitingBucket) {
        this.visibleStatuses.statuses = statusCollection;
      }
    },
    getAggregateIndex(aggregateType) {
      return aggregateType.replace(/\s+/, '-').toLowerCase();
    },
    getCollectionOfStatusesInBucket(statuses) {
      if (statuses === undefined) {
        return [];
      }

      return Object.values(statuses);
    },
    listClasses(aggregateType) {
      const classNames = {
        'status-list__list': true
      };

      if (this.isAggregateVisible(aggregateType)) {
        classNames['status-list__list--full-width'] = true;
      }

      const visitingBucketList = this.visibleStatuses.name === 'bucket';

      if (
        this.getAggregateIndex(aggregateType) === 'bucket' &&
        visitingBucketList &&
        Object.keys(this.visibleStatuses.statuses).length === 0
      ) {
        classNames['status-list__empty-bucket'] = true;
      }

      const emptyStatusList =
        Object.keys(this.visibleStatuses.statuses).length === 0;
      if (!visitingBucketList && (emptyStatusList || this.loadingStatuses)) {
        classNames['status-list__empty-list'] = true;
      }

      return classNames;
    },
    getStatusListItemClass(status) {
      const classes = { 'status-list__item': true };

      if (this.canStatusBeShared(status)) {
        classes['status-list__item--can-be-shared'] = true;
      }

      if (!this.canBeShared() || this.canStatusBeShared(status)) {
        return classes;
      }

      return {};
    },
    getStatuses({ aggregateType, bustCache, filter, maxStatusesPerList }) {
      this.visibleStatuses.statuses = [];
      if (this.$route.name === 'aggregate') {
        this.visibleStatuses.name = this.$route.params.aggregateType;
        this.visibleStatuses.statuses = [];
      }
      if (
        this.$route.name === 'press-review' ||
        this.$route.name === 'bucket'
      ) {
        this.visibleStatuses.name = this.$route.name;
        this.visibleStatuses.statuses = [];
      }

      let statusLimitPerList = 10;
      if (typeof maxStatusesPerList !== 'undefined') {
        statusLimitPerList = maxStatusesPerList;
      }

      let shouldBustCache = false;
      if (typeof bustCache !== 'undefined' && aggregateType !== 'bucket') {
        shouldBustCache = bustCache;
      }

      if (this.shouldGuardAgainstUndefinedRoute()) {
        return;
      }

      const aggregateIndex = this.getAggregateIndex(aggregateType);
      const intendingToVisitBucket = aggregateIndex === 'bucket';

      if (
        (!shouldBustCache && intendingToVisitBucket) ||
        this.aggregateTypes[aggregateIndex].statuses.length > 0
      ) {
        this.switchBetweenVisibleStatuses({
          aggregateType,
          statuses: this.visibleStatuses,
          filter,
          statusLimitPerList
        });
        return;
      }

      const route = `${this.routes[aggregateIndex].source}`;
      const authenticationToken = localStorage.getItem('x-auth-token');

      this.replaceBucketFromPersistentLayer();

      this.$http
        .get(route, {
          headers: { 'x-auth-token': authenticationToken }
        })
        .then(response => {
          this.statuses = null;
          try {
            this.aggregateTypes[aggregateIndex].statuses = this.formatStatuses(
              response.data
            );
          } catch (error) {
            this.logger.error(error.message, 'status-list');
            return;
          }

          this.switchBetweenVisibleStatuses({
            aggregateType,
            statuses: this.visibleStatuses,
            filter,
            statusLimitPerList
          });
          EventHub.$emit('status_list.after_fetch');
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    },
    getTransitionGroupClasses() {
      const classes = { 'status-list__transition': true };
      if (this.$route.name === 'bucket') {
        classes['status-list__transition--bucket'] = true;
      }

      return classes;
    },
    isAggregateVisible(aggregateType) {
      debugger;
      const aggregateIndex = this.getAggregateIndex(aggregateType);
      return aggregateIndex === this.visibleStatuses.name;
    },
    shouldGuardAgainstUndefinedRoute() {
      return typeof this.routes === 'undefined';
    },
    addToBucket({ status }) {
      const persistedStatus = Object.assign(
        { foundIn: this.visibleStatuses.name },
        status
      );
      this.persistAdditionToBucket(persistedStatus);
      this.refreshBucket();
    },
    removeFromBucket({ status }) {
      this.persistRemovalFromBucket(status);
      const isConversationInBucket = this.isConversationInBucket()(
        status.statusId
      );
      if (isConversationInBucket) {
        this.persistConversationRemovalFromBucket(status.statusId);
      }
      this.refreshBucket();
    },
    showLoadingMessage() {
      this.state.loadingStatuses = true;
      this.visibleStatuses.statuses = [];
    },
    switchBetweenVisibleStatuses({
      aggregateType,
      statuses,
      filter,
      statusLimitPerList
    }) {
      const visibleStatuses = statuses;
      const aggregateIndex = this.getAggregateIndex(aggregateType);

      Object.keys(this.aggregateTypes).forEach(aggregateName => {
        this.aggregateTypes[
          this.getAggregateIndex(aggregateName)
        ].isVisible = false;
      });
      this.aggregateTypes[aggregateIndex].isVisible = true;

      let statusCollection = {};
      statusCollection = Object.assign(
        {},
        this.aggregateTypes[aggregateIndex].statuses
      );
      visibleStatuses.statuses = this.filterStatuses(statusCollection, filter);
      visibleStatuses.name = aggregateIndex;
      this.loadingStatuses = false;

      if (typeof statusLimitPerList !== 'undefined') {
        visibleStatuses.statuses = Object.values(
          visibleStatuses.statuses
        ).slice(0, statusLimitPerList);
      }

      return visibleStatuses;
    }
  }
};
</script>

<style scoped>
@import './status-list.scss';
</style>
