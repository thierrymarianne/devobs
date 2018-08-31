import VueRouter from 'vue-router';
import Vue from 'vue';

import Notifications from 'vue-notification';
import VueClipboards from 'vue-clipboards';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import App from './components/app.vue';
import routes from './modules/routes';
import SharedState from './modules/shared-state';
import Api from './modules/axios';

import Styles from './styles';
import Config from './config';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(Notifications);
Vue.use(VueClipboards);

Api.useAxios(Vue);

if (SharedState.isProductionModeActive()) {
  const dsn = Config.raven.dsn;
  Raven.config(dsn)
  .addPlugin(RavenVue, Vue)
  .install();
}

const router = new VueRouter({
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (typeof from.query.peek !== 'undefined'
  && typeof to.query.peek === 'undefined'
  ) {
    next({ name: to.name, query: from.query });
    return;
  }

  next();
});

// eslint-disable-next-line
const app = new Vue({
  el: '#app',
  router,
  style: Styles.styles,
  components: {
    App,
  },
});

window.app = app;
