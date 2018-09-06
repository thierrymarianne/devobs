<template>
  <div
    v-if="isVisible"
    class="modal-window"
    @click="hide"
    @shortkey="hide()"
  >
    <div
      :style="mediaStyle"
      class="modal-window__image"
    />
    <div
      v-shortkey="['esc']"
      class="modal-window-overlay"
    />
  </div>
</template>

<script>
import { css } from 'emotion';
import EventHub from '../../modules/event-hub';

export default {
  name: 'modal-window',
  data() {
    return {
      isVisible: false,
      mediaStyle: '',
      overflowStyle: {},
      noOverflowStyle: {},
      body: {}
    };
  },
  mounted() {
    EventHub.$on('modal_window.show_intended', this.show);
    this.noOverflowStyle = css`
      overflow-y: hidden;
    `;
    this.overflowStyle = css`
      overflow-y: auto;
    `;
    this.body = document.querySelector('body');
  },
  methods: {
    getBackgroundProperties(media) {
      return `url(${media.url}) center / 100vw no-repeat`;
    },
    getMediaProperties(media) {
      return {
        background: this.getBackgroundProperties(media),
        height: `${media.sizes.small.h}px`,
        width: `${media.sizes.small.w}.px`
      };
    },
    show({ media }) {
      this.isVisible = true;
      this.body.classList.remove(this.overflowStyle);
      this.body.classList.add(this.noOverflowStyle);
      this.mediaStyle = this.getMediaProperties(media);
    },
    hide() {
      this.body.classList.remove(this.noOverflowStyle);
      this.body.classList.add(this.overflowStyle);
      this.isVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './modal-window.scss';
</style>
