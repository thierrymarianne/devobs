<template>
  <div class="action-menu">
    <div :class="getActionMenuContainerClasses">
      <button
        :class="getButtonClass('pressReview')"
        @click="intendToGet('pressReview')"
      >Press Review</button>
      <button
        v-for="menuItem in menuItemsButPressReview"
        v-if="menuItem !== 'actions' && isVisible[menuItem]"
        :class="getButtonClass(menuItem)"
        @click="intendToGet(menuItem)"
      >{{ getMenuLabel(menuItem) }}</button>
      <button
        :class="getButtonClass('bucket')"
        @click="intendToGet('bucket')"
      >Bucket</button>
      <button
        class="action-menu__refresh-button"
        @click="refreshStatuses"
      >
        <font-awesome-icon
          class="action-menu__refresh-icon"
          icon="redo-alt"
        />
      </button>
    </div>
    <div
      :class="getActionMenuButtonClasses"
      @click="showMenu = !showMenu"
    >
      <font-awesome-icon
        :icon="getToggleMenuIcon"
        class="action-menu__toggle-menu-icon"
      />
    </div>
    <div
      :style="'width: ' + loadedContentPercentage + '%'"
      class="action-menu__progress-bar"/>
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  name: 'ActionMenu',
  mixins: [ApiMixin],
  data() {
    return {
      showMenu: false,
      visibleStatuses: SharedState.state.visibleStatuses,
      loadedContentPercentage: SharedState.state.loadedContentPercentage
    };
  },
  computed: {
    getActionMenuButtonClasses() {
      const classes = { 'action-menu__button': true };

      if (!this.showMenu) {
        classes['action-menu__button--with-top-border'] = true;
      }

      return classes;
    },
    getActionMenuContainerClasses() {
      const classes = { 'action-menu__container': true };

      if (this.showMenu) {
        classes['action-menu__container--is-visible'] = true;
      }

      return classes;
    },
    getToggleMenuIcon() {
      if (this.showMenu) {
        return 'arrow-alt-circle-up';
      }

      return 'arrow-alt-circle-down';
    },
    isVisible() {
      const hasFullMenu =
        'peek' in this.$route.query ||
        !SharedState.getEnvironmentParameters().productionMode;

      const visibilities = {};
      Object.keys(this.routes).forEach(aggregateType => {
        if (aggregateType === 'actions') {
          return;
        }

        if (aggregateType === 'pressReview') {
          return;
        }

        visibilities[aggregateType] = hasFullMenu;
      });
      visibilities.bucket = hasFullMenu;

      return visibilities;
    },
    menuItemsButPressReview() {
      const routeNames = Object.keys(this.routes);
      return routeNames.sort();
    }
  },
  methods: {
    getButtonClass(aggregateType) {
      const classes = { 'action-menu__get-statuses': true };

      if (this.visibleStatuses.name === aggregateType) {
        classes['action-menu__get-statuses--active'] = true;
      }

      return classes;
    },
    getMenuLabel(aggregateType) {
      return aggregateType;
    },
    intendToGet(aggregateType) {
      if (aggregateType === 'bucket') {
        EventHub.$emit('status_list.intent_to_refresh_bucket', {
          aggregateType
        });
      }

      EventHub.$emit('status_list.reload_intended', {
        aggregateType
      });
    },
    refreshStatuses() {
      EventHub.$emit('status_list.reload_intended', {
        aggregateType: this.visibleStatuses.name,
        bustCache: true
      });
    }
  }
};
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>
