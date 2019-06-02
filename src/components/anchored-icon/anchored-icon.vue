<template>
  <span :class="classes.wrapperClasses">
    <a v-if="url" :href="url" :class="classes.anchorClasses" target="_blank">
      <font-awesome-icon :icon="icons" :class="classes.iconClasses" />
    </a>
    <font-awesome-icon v-else :icon="icons" :class="classes.iconClasses" />
  </span>
</template>

<script>
export default {
  name: 'anchored-icon',
  props: {
    wrapperClasses: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      default: ''
    },
    iconClasses: {
      type: Object,
      default: () => ({})
    },
    icons: {
      type: Array,
      required: true
    },
    anchorClasses: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      classes: {
        wrapperClasses: {
          'anchored-icon': true,
          ...this.wrapperClasses
        },
        iconClasses: {
          'anchored-icon__icon': true,
          ...this.iconClasses
        },
        anchorClasses: {
          'anchored-icon__anchor': true,
          ...this.anchorClasses
        }
      }
    };
  }
};
</script>

<style lang="scss" scoped>
@import './anchored-icon.scss';
</style>
