<template>
  <div class="status-list">
    <div :class="getTransitionGroupClasses()">
      <div
        v-for="aggregateType in aggregateTypes"
        :class="listClasses(aggregateType.name)"
        :key="aggregateType.name"
        :data-key="aggregateType.name"
      >
        <template v-if="isStatusListVisible(aggregateType)">
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
              :status-at-first="status"
              can-be-shared-at-first
            />
            <conversation
              v-else
              :originates-from="status"
              :statuses="status.conversation"
            />
          </div>
        </template>
        <p
          v-else-if="isAggregateVisibleButEmpty(aggregateType.name)"
          class="status-list__item-none"
        >{{ emptyAggregateText() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import { css } from 'emotion';
import { throttle } from 'lodash-es';

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
      emptyListKey: 'empty-list',
      state: SharedState.state,
      visibleStatuses: SharedState.state.visibleStatuses,
      errors: [],
      errorMessages: SharedState.errors,
      lastScrollTop: 0,
      logger: SharedState.logger,
      logLevel: SharedState.logLevel,
      environment: SharedState.getEnvironmentParameters(),
      visitedAggregate: 'press-review'
    };
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name) {
        this.handleNavigation({ to });
        return;
      }

      if (
        to.name === 'aggregate' &&
        to.params.aggregateType !== from.params.aggregateType
      ) {
        this.handleNavigation({ to });
        return;
      }

      if (
        (to.name === 'aggregate-status' || to.name === 'status') &&
        to.params.statusId !== from.params.statusId
      ) {
        this.handleNavigation({ to });
      }
    }
  },
  created() {
    this.aggregateTypes = this.declareAggregateTypesFromRoutes(this.routes);

    const noHorizontalOverflow = css`
      overflow-x: hidden;
    `;
    document.body.classList.add(noHorizontalOverflow);

    this.handleNavigation({});
  },
  mounted() {
    EventHub.$on('status.added_to_bucket', this.addToBucket);
    EventHub.$on('status_list.after_fetch', this.refreshBucket);
    EventHub.$on('status_list.intent_to_refresh_bucket', this.refreshBucket);
    EventHub.$on('status_list.load_intended', this.showLoadingMessage);
    EventHub.$on(
      'status_list.load_more_statuses_intended',
      this.appendMoreStatus
    );
    EventHub.$on(
      'status_list.apologize_about_empty_list_intended',
      this.showEmptyStatusCollectionMessage
    );
    EventHub.$on('status_list.reload_intended', this.getStatuses);
    EventHub.$on('status.removed_from_bucket', this.removeFromBucket);

    window.addEventListener('scroll', throttle(this.handleScroll, 1000));
  },
  beforeMount() {
    this.visitedAggregate = this.getVisitedAggregate();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.handleNavigation({ to });
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.handleNavigation({ to });
    next();
  },
  beforeRouteLeave(to, from, next) {
    this.handleNavigation({ to });
    next();
  },
  beforeUpdate() {
    this.visitedAggregate = this.getVisitedAggregate();
  },
  beforeDestroy() {
    EventHub.$off('status_list.load_intended');
    EventHub.$off('status_list.reload_intended');
    EventHub.$off('status_list.intent_to_refresh_bucket');
    EventHub.$off('status_list.after_fetch');
    EventHub.$off('status_list.load_more_statuses_intended');
    EventHub.$off('status.added_to_bucket');
    EventHub.$off('status.removed_from_bucket');
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET,
      ActionTypes.PERSIST_REMOVAL_FROM_BUCKET,
      ActionTypes.RESTORE_BUCKET_FROM_PERSISTENCE_LAYER
    ]),
    ...mapGetters(['getStatusesInBucket', 'isInBucket']),
    appendMoreStatus() {
      const nextStatusIndex = this.nextStatusIndex();

      const fullStatusCollection = Object.values(
        this.visibleStatuses.originalCollection
      );

      if (nextStatusIndex > fullStatusCollection.length - 1) {
        return;
      }

      const nextStatus = fullStatusCollection[nextStatusIndex];
      this.visibleStatuses.statuses.push(nextStatus);
    },
    canBeShared() {
      return this.$route.name === 'aggregate-status';
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

      if (
        !this.state.loadingStatuses &&
        this.visibleStatuses.statuses.length === 0
      ) {
        return 'This list of statuses is empty.';
      }

      if (this.$route.name === 'status') {
        return 'Your status of interest is being loaded.';
      }

      return 'Your statuses of interest are being loaded.';
    },
    handleNavigation({ to }) {
      let nextRoute = this.$route;
      if (typeof to !== 'undefined') {
        nextRoute = to;
      }

      if (nextRoute.name === 'aggregate-status') {
        this.replaceBucketFromPersistentLayer();
        this.refreshBucket({ aggregateType: 'bucket' });

        const { statusId } = nextRoute.params;
        this.getStatuses({
          aggregateType: nextRoute.params.aggregateType,
          filter: status => status.statusId === statusId
        });
      }

      if (nextRoute.name === 'status') {
        const action = this.routes.actions.fetchStatus;
        action.route = this.routes.actions.fetchStatus.route.replace(
          ':statusId',
          nextRoute.params.statusId
        );
        this.getStatuses({ action });

        return nextRoute;
      }

      if (nextRoute.name === 'aggregate') {
        this.getStatuses({ aggregateType: nextRoute.params.aggregateType });
      }

      if (nextRoute.name === 'press-review') {
        this.getStatuses({ aggregateType: 'press-review' });
      }

      if (nextRoute.name === 'bucket') {
        this.replaceBucketFromPersistentLayer();
        this.refreshBucket({ aggregateType: 'bucket' });

        this.getStatuses({ aggregateType: 'bucket' });

        return nextRoute;
      }

      this.refreshBucket();

      return nextRoute;
    },
    handleScroll() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      if (scrollTop > 0 && this.lastScrollTop <= scrollTop) {
        this.lastScrollTop = scrollTop;
        EventHub.$emit('status_list.load_more_statuses_intended');

        return;
      }

      this.lastScrollTop = scrollTop;
    },
    nextStatusIndex() {
      const fullStatusCollection = Object.values(
        this.visibleStatuses.originalCollection
      );

      if (this.visibleStatuses.statuses.length === 0) {
        return 0;
      }

      const lastStatus = this.visibleStatuses.statuses[
        this.visibleStatuses.statuses.length - 1
      ];
      const lastStatusIndex = fullStatusCollection.indexOf(lastStatus);

      return lastStatusIndex + 1;
    },
    getStatusKey(status, aggregateType) {
      return `${aggregateType.name}:${status.statusId}`;
    },
    getVisitedAggregate() {
      if (
        this.$route.name === 'bucket' ||
        this.$route.name === 'press-review' ||
        this.$route.name === 'status'
      ) {
        return this.$route.name;
      }

      return this.$route.params.aggregateType;
    },
    isStatusListVisible({ name }) {
      const aggregateIndex = this.getAggregateIndex(name);

      if (this.$route.name === 'bucket') {
        return this.aggregateTypes.bucket.statuses.length;
      }

      if (
        this.$route.name === 'press-review' ||
        this.$route.name === 'status'
      ) {
        return (
          name === this.$route.name &&
          this.aggregateTypes[aggregateIndex].statuses.length > 0
        );
      }

      const visitedAggregate = this.$route.params.aggregateType;

      return (
        this.aggregateTypes[aggregateIndex].statuses.length > 0 &&
        !this.state.loadingStatuses &&
        name === visitedAggregate
      );
    },
    isStatusVisible(status) {
      return !status.conversation || this.$route.name !== 'bucket';
    },
    refreshBucket(event = {}) {
      const statusesInBucket = this.getStatusesInBucket();
      let statusCollection = this.getCollectionOfStatusesInBucket(
        statusesInBucket
      );

      const visitingBucket = this.visibleStatuses.name === 'bucket';
      if (visitingBucket) {
        statusCollection = this.expandConversations(statusCollection, event);
      }

      this.setBucketCollection(
        statusCollection,
        typeof event.next === 'function'
      );

      if (visitingBucket) {
        this.aggregateTypes.bucket.statuses = statusCollection;
        this.visibleStatuses.statuses = statusCollection;
      }

      if (typeof event.next === 'function') {
        event.next();
      }
    },
    setBucketCollection(statusCollection, visible = false) {
      this.aggregateTypes.bucket = {
        statuses: statusCollection,
        isVisible: visible,
        name: 'bucket'
      };
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
      if (
        !visitingBucketList &&
        (emptyStatusList || this.state.loadingStatuses)
      ) {
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
    getStatuses({
      action,
      aggregateType,
      bustCache,
      filter,
      maxStatusesPerList
    }) {
      this.visibleStatuses.statuses = [];
      if (this.$route.name === 'aggregate') {
        this.visibleStatuses.name = this.$route.params.aggregateType;
        this.visibleStatuses.statuses = [];
      }

      if (
        this.$route.name === 'bucket' ||
        this.$route.name === 'press-review' ||
        this.$route.name === 'status'
      ) {
        this.visibleStatuses.name = this.$route.name;
        this.visibleStatuses.statuses = [];
      }

      let statusLimitPerList = this.state.maxStatusPerAggregateAtFirst;
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

      const authenticationToken = localStorage.getItem('x-auth-token');
      const requestOptions = {
        headers: { 'x-auth-token': authenticationToken }
      };

      if (typeof action !== 'undefined') {
        const { method } = action;
        requestOptions.params = { refresh: 1 };
        this.$http[method](action.route, requestOptions)
          .then(response => {
            try {
              const statuses = this.formatStatuses(response.data);
              this.switchBetweenVisibleStatuses({ statuses });
              return statuses;
            } catch (error) {
              return this.logger.error(error.message, 'status-list');
            }
          })
          .catch(error => {
            return this.logger.error(error.message, 'status-list');
          });

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

      this.replaceBucketFromPersistentLayer();

      this.$http
        .get(route, requestOptions)
        .then(response => {
          this.statuses = null;
          try {
            this.aggregateTypes[aggregateIndex].statuses = this.formatStatuses(
              response.data
            );
          } catch (error) {
            return this.logger.error(error.message, 'status-list');
          }

          this.switchBetweenVisibleStatuses({
            aggregateType,
            statuses: this.visibleStatuses,
            filter,
            statusLimitPerList
          });
          return EventHub.$emit('status_list.after_fetch');
        })
        .catch(e => {
          if (this.$route.name === 'aggregate-status') {
            this.$router.push({
              name: 'status',
              params: {
                statusId: this.$route.params.statusId
              }
            });
            this.getStatuses({ action: this.routes.actions.fetchStatus });
          }
          return this.logger.error(e.message, 'status-list', e);
        });
    },
    getTransitionGroupClasses() {
      const classes = { 'status-list__transition': true };
      if (this.$route.name === 'bucket') {
        classes['status-list__transition--bucket'] = true;
      }

      return classes;
    },
    isAggregateVisible(aggregateType) {
      const aggregateIndex = this.getAggregateIndex(aggregateType);
      return aggregateIndex === this.visibleStatuses.name;
    },
    isAggregateVisibleButEmpty(aggregateType) {
      return (
        this.isAggregateVisible(aggregateType) &&
        this.visibleStatuses.statuses.length === 0
      );
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
    showEmptyStatusCollectionMessage() {
      this.visibleStatuses.statuses = Object.values(
        this.visibleStatuses.originalCollection
      );
    },
    showLoadingMessage() {
      this.state.loadingStatuses = true;
      this.visibleStatuses.statuses = [];
    },
    hideLoadingMessage() {
      this.state.loadingStatuses = false;
    },
    switchBetweenVisibleStatuses({
      aggregateType,
      statuses,
      filter,
      statusLimitPerList
    }) {
      let visibleStatuses;

      if (this.$route.name === 'status') {
        this.visibleStatuses.name = 'status';
        this.visibleStatuses.statuses = statuses;
        this.visibleStatuses.originalCollection = statuses;
        this.aggregateTypes.status.isVisible = true;
        this.aggregateTypes.status.statuses = Object.values(
          Object.assign({}, statuses)
        );

        this.hideLoadingMessage();

        return statuses;
      }

      if (
        this.$route.name === 'bucket' &&
        this.visibleStatuses.name === 'bucket'
      ) {
        const bucketStatuses = this.getCollectionOfStatusesInBucket(
          this.getStatusesInBucket()
        );
        this.setBucketCollection(bucketStatuses, true);
        this.visibleStatuses.originalCollection = bucketStatuses;

        if (
          this.visibleStatuses.statuses.length === 0 &&
          this.visibleStatuses.originalCollection.length > 0
        ) {
          this.setBucketCollection(
            this.getCollectionOfStatusesInBucket(this.getStatusesInBucket()),
            true
          );

          visibleStatuses = Object.values(
            this.visibleStatuses.originalCollection
          );

          const areThereVisibleBucketItems =
            visibleStatuses.length > 0 &&
            this.aggregateTypes.bucket.statuses.length > 0;

          // Prevent wrongly removing items from bucket
          // when none is available to refill it right away
          if (areThereVisibleBucketItems) {
            this.visibleStatuses.statuses = visibleStatuses.slice(
              0,
              visibleStatuses.length
            );
            this.aggregateTypes.bucket.statuses = visibleStatuses.slice(
              0,
              visibleStatuses.length
            );
          }

          this.aggregateTypes.bucket.isVisible = true;

          this.hideLoadingMessage();

          if (areThereVisibleBucketItems) {
            return visibleStatuses.slice(0, visibleStatuses.length - 1);
          }

          return this.aggregateTypes.bucket.statuses;
        }
      }

      visibleStatuses = statuses;
      const aggregateIndex = this.getAggregateIndex(aggregateType);

      visibleStatuses.name = aggregateIndex;

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

      visibleStatuses.originalCollection = statusCollection;

      let filteredStatuses = this.filterStatuses(statusCollection, filter);

      if (typeof statusLimitPerList !== 'undefined') {
        filteredStatuses = Object.values(filteredStatuses).slice(
          0,
          statusLimitPerList
        );
      }

      visibleStatuses.statuses = filteredStatuses;

      this.hideLoadingMessage();

      return visibleStatuses;
    }
  }
};
</script>

<style scoped>
@import './status-list.scss';
</style>
