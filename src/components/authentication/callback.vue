<template>
  <div
    v-show="false"
    class="spinner"
  >
    Please wait for the authentication process to finish...
    <authenticator
      ref="authenticator"
    />
  </div>
</template>

<script>
import Authenticator from './authenticator.vue';

export default {
  name: 'callback',
  components: { Authenticator },
  mounted() {
    this.$refs.authenticator.handleAuthentication();
  }
};
</script>
