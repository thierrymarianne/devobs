<template>
  <div class="pagination">
    <action-icon
      :button-classes="classes.previousButton"
      :click-handler="goToPreviousPageHandler"
      :icon-classes="classes.previousIcon"
      :icons="previousIcons"
    />
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
      required: true
    },
    nextButtonClasses: {
      type: Object,
      required: true
    },
    previousIconClasses: {
      type: Object,
      required: true
    },
    nextIconClasses: {
      type: Object,
      required: true
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
  data() {
    return {
      classes: {
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
      }
    };
  }
};
</script>

<style lang="scss" scoped>
@import 'pagination-menu.scss';
</style>
