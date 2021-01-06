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
      <div
        v-if="affiliatedWebsites.length > 0"
        class="intro__description-container"
      >
        <form
          v-if="showLightSelector"
          class="intro__affiliated-websites"
          method="get"
          ref="websiteSelector"
          :action="selectedWebsiteLink"
        >
          <label
            for="affiliated-websites"
            class="intro__affiliated-websites-label"
          >
              <span class="intro__affiliated-websites-label-prefix"><!--
                -->Browse other snapshots
              </span>
            <select
              id="affiliated-websites"
              v-model="selectedWebsite"
              v-on:change="changeWebsite(selectedWebsite)"
              class="intro__affiliated-websites-selector"
            >
              <option
                class="intro__affiliated-websites-option"
                v-for="(website, index) in affiliatedWebsites"
                :key="index"
                :value="website.hostname"
                v-text="`https://${website.hostname}`"
              >
              </option>
            </select>
          </label>
        </form>
        <form
          class="intro__affiliated-websites"
          v-else
        >
          <fieldset class="intro__affiliated-websites-fieldset">
            <legend>Daily Snapshots</legend>
            <label
              class="intro__affiliated-websites-label"
            >
              <span
                class="intro__affiliated-websites-label-prefix">
                Other daily snapshots at
              </span>
              <select
                v-model="selectedWebsite"
                class="intro__affiliated-websites-selector"
              >
                <option
                  v-for="(website, index) in affiliatedWebsites"
                  :key="index"
                  :value="website.hostname"
                  v-text="`https://${website.hostname}`"
                >
                </option>
              </select>
            </label>
            <a
              v-if="selectedWebsiteLink"
              :class="affiliatedWebsitesLinkClasses"
              v-text="selectedWebsiteLinkLabel"
              :href="selectedWebsiteLink"
            />
            <span
              class="intro__visiting"
              v-else v-text="selectedWebsiteLinkLabel" />
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import logo from "~/assets/logo.png";

export default {
  name: "intro",
  props: {
    affiliatedWebsites: {
      type: Array,
      default: []
    },
    showLightSelector: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    affiliatedWebsitesLinkClasses() {
      return {
        'intro__external-link': true,
        'intro__external-link--visible': this.selectedWebsite,
      };
    },
    selectedWebsiteLink() {
      return this.selectedWebsite ? `https://${this.selectedWebsite}` : null;
    },
    selectedWebsiteLinkLabel() {
      return this.selectedWebsite
        ? `Go to ${this.selectedWebsiteLink}`
        : `You are currently visiting https://${window.location.hostname}`;
    }
  },
  methods: {
    changeWebsite(website) {
      window.location = `https://${website}`;
    }
  },
  data() {
    return {
      currentRoute: this.$router.currentRoute.path,
      selectedWebsite: null,
      logo
    }
  }
}
</script>

<style lang="scss" scoped>
@import './intro.scss';
</style>
