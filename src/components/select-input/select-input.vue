<template>
  <label :class="classes.wrapper" :for="id">
    <span :class="classes.text">{{ label }}</span>
    <select
      :class="classes.select"
      :id="id"
      :value="choice"
      name="aggregate"
      @input="handleInput"
    >
      <option
        v-for="option in options"
        :class="classes.option"
        :key="option.id"
        :value="option[optionValueProp]"
        >{{ option[optionTextProp] }}</option
      >
    </select>
  </label>
</template>

<script>
export default {
  name: 'select-input',
  model: {
    prop: 'choice',
    event: 'input'
  },
  props: {
    choice: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: 'select-input'
    },
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    optionTextProp: {
      type: String,
      required: true
    },
    optionValueProp: {
      type: String,
      required: true
    },
    optionClasses: {
      type: Object,
      default: () => ({})
    },
    selectClasses: {
      type: Object,
      default: () => ({})
    },
    textClasses: {
      type: Object,
      default: () => ({})
    },
    wrapperClasses: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    classes() {
      return {
        option: {
          'select-input__option': true,
          ...this.optionClasses
        },
        select: {
          'select-input__select': true,
          ...this.selectClasses
        },
        text: {
          'select-input__text': true,
          ...this.textClasses
        },
        wrapper: {
          'select-input': true,
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
@import 'select-input.scss';
</style>
