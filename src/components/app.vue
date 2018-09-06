<template>
  <div class='app'>
    <action-menu />
    <router-view></router-view>
    <modal-window />
  </div>
</template>

<script>
import ActionMenu from './action-menu/action-menu.vue';
import ModalWindow from './modal-window/modal-window.vue';

export default {
  name: 'app',
  components: {
    ActionMenu,
    ModalWindow
  }
};
</script>
