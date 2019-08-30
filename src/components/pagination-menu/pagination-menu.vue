<template>
  <div class="pagination">
    <action-icon
      :button-classes="classes.previousButton"
      :click-handler="goToPreviousPageHandler"
      :icon-classes="classes.previousIcon"
      :icons="previousIcons"
    />
    <slot></slot>
    <action-icon
      :button-classes="classes.nextButton"
      :click-handler="goToNextPageHandler"
      :icon-classes="classes.nextIcon"
      :icons="nextIcons"
    />
  </div>
</template>

<script>
import ActionIcon from '../action-icon/action-icon.vue';

export default {
  name: 'pagination-menu',
  components: { ActionIcon },
  props: {
    isPreviousButtonVisible: {
      type: Boolean,
      required: true
    },
    isNextButtonVisible: {
      type: Boolean,
      required: true
    },
    previousIcons: {
      type: Array,
      required: true
    },
    nextIcons: {
      type: Array,
      required: true
    },
    previousButtonClasses: {
      type: Object,
      default: () => ({})
    },
    nextButtonClasses: {
      type: Object,
      default: () => ({})
    },
    previousIconClasses: {
      type: Object,
      default: () => ({})
    },
    nextIconClasses: {
      type: Object,
      default: () => ({})
    },
    goToPreviousPageHandler: {
      type: Function,
      required: true
    },
    goToNextPageHandler: {
      type: Function,
      required: true
    }
  },
  computed: {
    classes() {
      return {
        previousButton: {
          pagination__previous: true,
          pagination__invisible: !this.isPreviousButtonVisible,
          ...this.previousButtonClasses
        },
        nextButton: {
          pagination__next: true,
          pagination__invisible: !this.isNextButtonVisible,
          ...this.previousButtonClasses
        },
        previousIcon: {
          'pagination__previous-icon': true,
          ...this.previousIconClasses
        },
        nextIcon: {
          'pagination__next-icon': true,
          ...this.previousIconClasses
        }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'pagination-menu.scss';
</style>
