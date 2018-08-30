<template>
  <div class='action-menu'>
    <div :class='getActionMenuContainerClasses'>
      <button 
        @click='intendToGet("pressReview")'
        :class='getButtonClass("pressReview")'
      >Press Review</button>
      <button
        @click='intendToGet("defaultAggregate")'
        :class='getButtonClass("defaultAggregate")'
        v-if='isVisible.defaultAggregate'
      >All</button>
      <button 
        @click='intendToGet("clojure")'
        :class='getButtonClass("clojure")'
        v-if='isVisible.clojure'
      >Clojure</button>
      <button 
        @click='intendToGet("golang")'
        :class='getButtonClass("golang")'
        v-if='isVisible.golang'
      >Golang</button>
      <button 
        @click='intendToGet("javascript")'
        :class='getButtonClass("javascript")'
        v-if='isVisible.javascript'
      >JavaScript</button>
      <button
        @click='intendToGet("php")'
        :class='getButtonClass("php")'
        v-if='isVisible.php'
      >PHP</button>
      <button
        @click='intendToGet("python")'
        :class='getButtonClass("python")'
        v-if='isVisible.python'
      >Python</button>
      <button 
        @click='intendToGet("rust")'
        :class='getButtonClass("rust")'
        v-if='isVisible.rust'
      >Rust</button>
      <button 
        @click='intendToGet("scala")'
        :class='getButtonClass("scala")'
        v-if='isVisible.scala'
      >Scala</button>
      <button 
        @click='intendToGet("vueJs")'
        :class='getButtonClass("vueJs")'
        v-if='isVisible.vueJs'
      >Vue.js</button>
      <button 
        @click='intendToGet("webPerformance")'
        :class='getButtonClass("webPerformance")'
        v-if='isVisible.webPerformance'
      >Web performance</button>
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
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api'
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  mixins: [ApiMixin],
  computed: {
    getToggleMenuIcon: function () {
      if (this.showMenu) {
        return 'arrow-alt-circle-up';      
      }

      return 'arrow-alt-circle-down';
    },
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
    isVisible: function () {
      const hasFullMenu = 'peek' in this.$route.query
      || !SharedState.getEnvironmentParameters().productionMode;

      const visibilities = {};
      Object.keys(this.routes).forEach((aggregateType) => {
        visibilities[aggregateType] = hasFullMenu
      });

      return visibilities;
    },
  },
  data: function () {
    return {
      showMenu: false,
      visibleStatuses: SharedState.state.visibleStatuses,
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
    intendToGet: function (aggregateType) {
      EventHub.$emit(
        'status_list.reload_intended',
        {
          aggregateType
        }
      );
    }
  },
}
</script>

<style lang='scss' scoped>
@import './action-menu.scss';
</style>