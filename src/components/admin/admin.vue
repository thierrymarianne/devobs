<template>
  <div class="admin">
    <router-view />
    <authenticator
      v-show="false"
      ref="authenticator"
    />
  </div>
</template>

<script>
import Authenticator from '../authentication/authenticator.vue';

export default {
  name: 'admin',
  components: { Authenticator },
  mounted() {
    this.$refs.authenticator.handleAuthentication();
  }
};
</script>

<style scoped lang="scss">
</style>
