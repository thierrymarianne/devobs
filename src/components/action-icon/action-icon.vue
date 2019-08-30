<template>
  <button :class="classes.button" @click="clickHandler">
    <font-awesome-icon :class="classes.icon" :icon="icons" />
  </button>
</template>

<script>
export default {
  name: 'action-icon',
  props: {
    buttonClasses: {
      type: Object,
      default: () => ({})
    },
    clickHandler: {
      type: Function,
      required: true
    },
    icons: {
      validator(value) {
        if (Array.isArray(value)) {
          return true;
        }

        return typeof value === 'string';
      },
      required: true
    },
    iconClasses: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    classes() {
      return {
        icon: {
          'action-icon__icon': true,
          ...this.iconClasses
        },
        button: {
          'action-icon': true,
          ...this.buttonClasses
        }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import './action-icon.scss';
</style>
