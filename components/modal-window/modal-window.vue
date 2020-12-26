<template>
  <div
    v-if="isVisible"
    class="modal-window"
    @click="hide"
  >
    <img
      :src="mediaUrl"
      class="modal-window__image"
    >
    <div
      class="modal-window-overlay"
    />
  </div>
</template>

<script>
import { css } from '@emotion/css';
import EventHub from '../../modules/event-hub';

export default {
  name: 'modal-window',
  data() {
    return {
      isVisible: false,
      mediaStyle: '',
      mediaUrl: '',
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
    show({ media }) {
      this.mediaUrl = media.url;
      this.body.classList.remove(this.overflowStyle);
      this.body.classList.add(this.noOverflowStyle);
      this.body.classList.add('containing-modal-window');
      this.isVisible = true;
    },
    hide() {
      this.isVisible = false;
      this.body.classList.remove(this.noOverflowStyle);
      this.body.classList.add(this.overflowStyle);
      this.body.classList.remove('containing-modal-window');
      this.mediaUrl = '';
    }
  }
};
</script>

<style lang="scss" scoped>
@import './modal-window.scss';
</style>
