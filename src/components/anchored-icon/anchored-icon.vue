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
    anchorClasses: {
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
    wrapperClasses: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      classes: {
        anchorClasses: {
          'anchored-icon__anchor': true,
          ...this.anchorClasses
        },
        iconClasses: {
          'anchored-icon__icon': true,
          ...this.iconClasses
        },
        wrapperClasses: {
          'anchored-icon': true,
          ...this.wrapperClasses
        }
      }
    };
  },
};
</script>

<style lang="scss" scoped>
@import './anchored-icon.scss';
</style>
