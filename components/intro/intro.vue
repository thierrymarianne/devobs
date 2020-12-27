<template>
  <div class="intro">
    <div class="intro__container">
      <div class="intro__logo-container">
        <a href="/">
          <img
            class="intro__logo lazyload"
            alt="logo"
            width="100"
            height="100"
            :data-src="logo"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import logo from "~/assets/logo.png";

export default {
  name: "intro",
  data() {
    return {
      currentRoute: this.$router.currentRoute.path,
      logo
    }
  }
}
</script>

<style lang="scss" scoped>
@import './intro.scss';
</style>
