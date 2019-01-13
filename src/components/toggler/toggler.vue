<template>
  <label
    :for="id"
    class="toggler"
    @click="($event) => handleClick($event)"
  >
    <input
      v-model="toggled"
      :id="id"
      :name="id"
      class="toggler__button"
      type="checkbox"
    >
    <span
      class="toggler__text"
    >{{ labelText }}</span>
  </label>
</template>

<script>
export default {
  name: 'toggler',
  props: {
    clickHandler: {
      type: Function,
      default: () => () => {}
    },
    id: {
      type: String,
      required: true
    },
    labelText: {
      type: String,
      default: ''
    },
    initiallyToggled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { toggled: this.initiallyToggled };
  },
  methods: {
    updateToggling(isToggled) {
      this.toggled = isToggled;
    },
    handleClick($event) {
      return this.clickHandler($event, this.updateToggling);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './toggler.scss';
</style>
