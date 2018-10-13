<template>
  <div class="action-menu">
    <div :class="getActionMenuContainerClasses">

      <button
        :class="getButtonClass('Press review')"
        @click="intendToGet('Press review')"
      >Press Review</button>

      <router-link
        v-for="(menuItem, index) in menuItemsButPressReview"
        :key='index'
        :to='getPathTo(menuItem)'
        :class="getButtonClass(menuItem)"
        active-class='action-menu__get-statuses--active'
        exact
        tag='button'
        @click.native="intendToGetAggregate(menuItem)"
      >{{ getMenuLabel(menuItem) }}</router-link>

      <button
        :class="getButtonClass('bucket')"
        @click="intendToGet('bucket')"
      >Bucket</button>

      <div class="action-menu__action-wrapper">

        <button
          class="action-menu__button action-menu__refresh-button"
          @click="showStatusesHavingMedia"
        >
          <font-awesome-icon
            class="action-menu__refresh-icon"
            icon="images"
          />
        </button>

        <button
          :class="getActionMenuButtonClasses"
          @click="showStatusesInAggregateTop10O"
        >
          <font-awesome-icon
            icon="fire"
            class="action-menu__toggle-menu-icon"
          />
        </button>

      </div>
    </div>

    <font-awesome-icon
      :class="getActionMenuButtonClasses"
      :icon="getToggleMenuIcon"
      class="action-menu__toggle-menu-icon"
      @click="toggleMenuVisibility"
    />

  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  name: 'action-menu',
  mixins: [ApiMixin],
  data() {
    return {
      showMenu: false,
      visibleStatuses: SharedState.state.visibleStatuses
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

        if (aggregateType === 'Press review') {
          return;
        }

        visibilities[aggregateType] = hasFullMenu;
      });
      visibilities.bucket = hasFullMenu;

      return visibilities;
    },
    menuItemsButPressReview() {
      const routeNames = [];
      Object.values(this.routes).forEach(route => {
        if (
          route.name === 'Press review' ||
          typeof route.name === 'undefined'
        ) {
          return;
        }
        routeNames.push(route.name);
      });

      return routeNames.sort().filter(route => {
        return this.isVisible[this.getAggregateIndex(route)];
      });
    }
  },
  mounted() {
    EventHub.$on('action_menu.hide_intended', this.hideActionMenu);
  },
  methods: {
    getAggregateIndex(aggregateType) {
      return aggregateType.replace(/\s+/g, '-').toLowerCase();
    },
    getButtonClass(aggregateType) {
      const classes = { 'action-menu__get-statuses': true };

      const aggregateIndex = this.getAggregateIndex(aggregateType);

      if (
        this.visibleStatuses.name === aggregateType ||
        this.visibleStatuses.name === aggregateIndex
      ) {
        classes['action-menu__get-statuses--active'] = true;
      }

      return classes;
    },
    getMenuLabel(aggregateType) {
      return aggregateType;
    },
    getPathTo(aggregateType) {
      return {
        name: 'aggregate',
        params: {
          aggregateType: this.getAggregateIndex(aggregateType)
        }
      };
    },
    hideActionMenu() {
      this.showMenu = false;
    },
    getRouteQuery() {
      const canPeekAtExtendedFeatures = 'peek' in this.$route.query;
      return canPeekAtExtendedFeatures ? { peek: null } : null;
    },
    intendToGet(aggregateType) {
      EventHub.$emit('status_list.load_intended');
      EventHub.$emit('action_menu.hide_intended');

      if (aggregateType === 'Press review') {
        this.$router.push({
          name: 'press-review',
          query: this.getRouteQuery()
        });
      }

      if (aggregateType === 'bucket') {
        EventHub.$emit('status_list.intent_to_refresh_bucket', {
          next: () => {
            this.$router.push({
              name: 'bucket',
              query: this.getRouteQuery()
            });
          }
        });
      }

      EventHub.$emit('status_list.reload_intended', {
        aggregateType
      });
    },
    intendToGetAggregate(aggregateType) {
      EventHub.$emit('action_menu.hide_intended');
      EventHub.$emit('status_list.load_intended');
      EventHub.$emit('status_list.reload_intended', {
        aggregateType
      });

      this.$router.push({
        name: 'aggregate',
        params: { aggregateType: this.getAggregateIndex(aggregateType) },
        query: this.getRouteQuery()
      });
    },
    showStatusesHavingMedia() {
      EventHub.$emit('status_list.reload_intended', {
        aggregateType: this.visibleStatuses.name,
        bustCache: true,
        filter: 'media'
      });
    },
    showStatusesInAggregateTop10O() {
      EventHub.$emit('status_list.reload_intended', {
        aggregateType: this.visibleStatuses.name,
        bustCache: true,
        filter: 'top100'
      });
    },
    toggleMenuVisibility() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>
