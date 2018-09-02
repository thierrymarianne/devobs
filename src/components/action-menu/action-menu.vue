<template>
  <div class='action-menu'>
    <div :class='getActionMenuContainerClasses'>
      <button 
        @click='intendToGet("pressReview")'
        :class='getButtonClass("pressReview")'
      >Press Review</button>
      <button
        @click='intendToGet(menuItem)'
        :class='getButtonClass(menuItem)'
        v-if='isVisible[menuItem]'
        v-for='menuItem in menuItemsButPressReview'
      >{{ getMenuLabel(menuItem) }}</button>
      <button 
        @click='intendToGet("bucket")'
        :class='getButtonClass("bucket")'
      >Bucket</button>
      <button
        class='action-menu__refresh-button'
        @click='refreshStatuses'
      >
        <font-awesome-icon 
          class='action-menu__refresh-icon'
          icon='redo-alt' 
        />
      </button>
    </div>
    <div
      :class='getActionMenuButtonClasses'
      @click='showMenu = !showMenu'
    >
      <font-awesome-icon 
        class='action-menu__toggle-menu-icon' 
        :icon='getToggleMenuIcon' 
      />
    </div>
    <div
      class='action-menu__progress-bar' 
      :style='"width: " + loadedContentPercentage + "%"'>
    </div>
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api'
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  mixins: [ApiMixin],
  computed: {
    getActionMenuButtonClasses: function () {
      const classes = { 'action-menu__button': true };

      if (!this.showMenu) {
        classes['action-menu__button--with-top-border'] = true
      }

      return classes;
    },
    getActionMenuContainerClasses: function () {
      const classes = { 'action-menu__container': true };

      if (this.showMenu) {
        classes['action-menu__container--is-visible'] = true
      }

      return classes;
    },
    getToggleMenuIcon: function () {
      if (this.showMenu) {
        return 'arrow-alt-circle-up';      
      }

      return 'arrow-alt-circle-down';
    },
    isVisible: function () {
      const hasFullMenu = 'peek' in this.$route.query
      || !SharedState.getEnvironmentParameters().productionMode;

      const visibilities = {};
      Object.keys(this.routes).forEach((aggregateType) => {
        if (aggregateType == 'pressReview') {
          return;
        }

        visibilities[aggregateType] = hasFullMenu
      });
      visibilities.bucket = hasFullMenu;

      return visibilities;
    },
    menuItemsButPressReview: function () {
      const routeNames = Object.keys(this.routes);
      return routeNames.sort();
    },
  },
  data: function () {
    return {
      showMenu: false,
      visibleStatuses: SharedState.state.visibleStatuses,
      loadedContentPercentage: SharedState.state.loadedContentPercentage,
    };
  },
  name: 'action-menu',
  methods: {
    getButtonClass(aggregateType) {
      const classes = { 'action-menu__get-statuses': true };

      if (this.visibleStatuses.name == aggregateType) {
        classes['action-menu__get-statuses--active'] = true;
      }

      return classes;
    },
    getMenuLabel: function (aggregateType) {
      return aggregateType;
    },
    intendToGet: function (aggregateType) {
      if (aggregateType === 'bucket') {
        EventHub.$emit(
          'status_list.intent_to_refresh_bucket',
          {
            aggregateType
          }
        );
      }

      EventHub.$emit(
        'status_list.reload_intended',
        {
          aggregateType
        }
      );
    },
    refreshStatuses: function () {
      EventHub.$emit(
        'status_list.reload_intended',
        {
          aggregateType: this.visibleStatuses.name,
          bustCache: true
        }
      );
    }
  },
}
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>