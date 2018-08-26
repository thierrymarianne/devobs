<template>
  <div class='app'>
    <action-menu />
    <router-view></router-view>
  </div>
</template>

<script>
import ActionMenu from './action-menu/action-menu.vue';

export default {
  name: 'app',
  components: {
    ActionMenu
  },
};
</script>