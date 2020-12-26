<template>
  <div>
    <highlist-list :show-media="!$device.isMobile"></highlist-list>
    <modal-window />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HighlistList from "../components/highlight-list/highlight-list.vue";
import VueRouter from 'vue-router';
import routes from '../modules/routes';
import {RouterMode} from "vue-router/types/router";
import SharedState from '../modules/shared-state';
import ModalWindow from "~/components/modal-window/modal-window.vue";

Vue.use(VueRouter);

const mode: RouterMode = 'history'
const routingOptions = {
  routes,
  mode
};

const router = new VueRouter(routingOptions);

if (SharedState.isProductionModeActive()) {
  Vue.config.productionTip = false;
}

export default Vue.extend({
  components: {
    HighlistList,
    ModalWindow
  }
})
</script>

<style>
</style>
