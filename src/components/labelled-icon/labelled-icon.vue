<template>
  <div class="labelled-icon">
    <div v-if="url" :class="classes.wrapper">
      <anchored-icon
        :icons="icon"
        :url="url"
        :anchor-classes="{}"
        :icon-classes="{}"
        :wrapper-classes="{ 'labelled__icon-wrapper': true }"
      />
      <a
        v-if="url"
        :href="url"
        class="labelled-icon__external-link"
        target="_blank"
      >
        <span class="labelled-icon__label">{{ label }}</span></a
      >
    </div>
    <div
      v-else
      class="labelled-icon labelled-icon__actionable"
      @click="clickHandler"
    >
      <anchored-icon
        :icons="icon"
        :anchor-classes="{}"
        :icon-classes="{}"
        :wrapper-classes="{ 'labelled__icon-wrapper': true }"
      />
      <span class="labelled-icon__label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
import AnchoredIcon from '../anchored-icon/anchored-icon.vue';

export default {
  name: 'labelled-icon',
  components: { AnchoredIcon },
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: Array,
      required: true
    },
    url: {
      type: String,
      default: ''
    },
    clickHandler: {
      type: Function,
      default: () => () => {}
    },
    wrapperClasses: {
      type: Object,
      default: () => ({
        'labelled-icon': true,
        'labelled-icon__actionable': true
      })
    }
  },
  data() {
    return {
      classes: {
        wrapper: {
          'labelled-icon__wrapper': true,
          ...this.wrapperClasses
        }
      }
    };
  }
};
</script>

<style lang="scss" scoped>
@import 'labelled-icon.scss';
</style>
