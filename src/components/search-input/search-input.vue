<template>
  <div :class="classes.wrapper">
    <label :class="classes.label" :for="id">
      <slot></slot>
      <input
        :class="classes.input"
        :id="id"
        :placeholder="placeholder"
        :value="keywords"
        type="text"
        @input="handleInput"
        @keyup.enter="eventHandler"
      />
    </label>
    <input
      :class="classes.button"
      :value="buttonValue"
      type="button"
      @click="eventHandler"
    />
  </div>
</template>

<script>
export default {
  name: 'search-input',
  model: {
    prop: 'keywords',
    event: 'input'
  },
  props: {
    buttonClasses: {
      type: Object,
      default: () => ({})
    },
    buttonValue: {
      type: String,
      default: 'Search'
    },
    eventHandler: {
      type: Function,
      required: true
    },
    id: {
      type: String,
      default: 'search-input'
    },
    inputClasses: {
      type: Object,
      default: () => ({})
    },
    keywords: {
      type: String,
      default: ''
    },
    labelClasses: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      required: true
    },
    wrapperClasses: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    classes() {
      return {
        button: {
          'search-input__button': true,
          ...this.buttonClasses
        },
        input: {
          'search-input__input': true,
          ...this.inputClasses
        },
        label: {
          'search-input__label': true,
          ...this.labelClasses
        },
        wrapper: {
          'search-input': true,
          ...this.wrapperClasses
        }
      };
    }
  },
  methods: {
    handleInput($event) {
      this.$emit('input', $event.target.value);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './search-input.scss';
</style>
