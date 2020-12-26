<template>
  <label
    :for="id"
    class="toggler"
    @click="($event) => handleClick($event)"
  >
    <input
      v-model="toggled"
      :checked="toggled"
      :id="id"
      :name="id"
      class="toggler__button"
      type="checkbox"
    >
    <span
      :class="textClasses"
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
    isSelected: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return { toggled: this.isSelected };
  },
  computed: {
    textClasses() {
      return {
        toggler__text: true,
        'toggler__text--highlighted': this.isSelected
      };
    }
  },
  updated() {
    this.toggled = this.isSelected;
  },
  methods: {
    updateToggling(isToggled) {
      this.toggled = isToggled;
    },
    handleClick($event) {
      $event.stopPropagation();

      if ($event.target.type !== 'checkbox') {
        return false;
      }

      const event = Object.assign($event, { itemId: this.id });
      this.clickHandler(event, this.updateToggling);

      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './toggler.scss';
</style>
