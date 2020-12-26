<template>
  <div class="intro">
    <div class="intro__container">
      <div class="intro__logo-container">
        <a href="/">
          <img
            class="intro__logo lazyload"
            alt="Revue de Presse logo"
            width="100"
            height="100"
            :data-src="logo"
          />
        </a>
      </div>
      <div class="intro__description-container">
        <p class="intro__description">Revue 2 presse est un <a
            class="intro__project"
            :href="currentRoute + '#project'">projet citoyen indépendant
          </a> qui s'adresse aux journalistes et à toute personne s'intéressant à l'actualité et à l'influence des médias sur l'opinion.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import logo from "../../assets/revue-de-presse_100x100.png";

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
