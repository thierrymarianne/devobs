import VueRouter from 'vue-router';
import Vue from 'vue';

import Notifications from 'vue-notification';
import VueClipboards from 'vue-clipboards';
import VueMoment from 'vue-moment';
import VueShortkey from 'vue-shortkey';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import Api from './modules/axios';
import App from './components/app.vue';
import EventHub from './modules/event-hub';
import SharedState from './modules/shared-state';
import Styles from './styles';
import Config from './config';
import routes from './modules/routes';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(Notifications);
Vue.use(VueMoment);
Vue.use(VueShortkey);
Vue.use(VueClipboards);

Api.useAxios(Vue);

const routingOptions = {
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
};

if (SharedState.isProductionModeActive()) {
  const dsn = Config.raven.dsn;
  Raven.config(dsn)
    .addPlugin(RavenVue, Vue)
    .install();

  routingOptions.mode = 'history';
}

const router = new VueRouter(routingOptions);

router.beforeEach((to, from, next) => {
  EventHub.$emit('status_list.load_intended');
  EventHub.$emit('action_menu.hide_intended');

  const peekQueryParamInSourceUrl = typeof from.query.peek !== 'undefined';
  const peekQueryParamNotInDestinationUrl = typeof to.query.peek === 'undefined';

  if (peekQueryParamInSourceUrl && peekQueryParamNotInDestinationUrl) {
    const nextQuery = Object.assign(to.query, { peek: 1 });
    next({ name: to.name, params: to.params, query: nextQuery });
    return;
  }

  next();
});

window.app = new Vue({
  el: '#app',
  router,
  style: Styles.styles,
  components: {
    App
  },
  store
});
