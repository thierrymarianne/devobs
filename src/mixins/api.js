import Config from '../config';

export default {
  computed: {
    routes: function () {
      const api = Config.api;
      const clojure = `${api.scheme}${api.host}${api.routes.clojure}`;
      const defaultAggregate = `${api.scheme}${api.host}${api.routes['latest-statuses']}`;
      const javascript = `${api.scheme}${api.host}${api.routes.javascript}`;
      const golang = `${api.scheme}${api.host}${api.routes.golang}`;
      const pressReview = `${api.scheme}${api.host}${api.routes['press-review']}`;
      const php = `${api.scheme}${api.host}${api.routes.php}`;
      const python = `${api.scheme}${api.host}${api.routes.python}`;
      const rust = `${api.scheme}${api.host}${api.routes.rust}`;
      const scala = `${api.scheme}${api.host}${api.routes.scala}`;
      const vueJs = `${api.scheme}${api.host}${api.routes['vue-js']}`;
      const webPerformance = `${api.scheme}${api.host}${api.routes['web-performance']}`;

      return {
        defaultAggregate,
        pressReview,
        clojure,
        golang,
        php,
        javascript,
        python,
        rust,
        scala,
        vueJs,
        webPerformance,
      };
    },
  },
};
