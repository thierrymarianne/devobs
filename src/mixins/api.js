import Config from '../config';

export default {
  computed: {
    routes: function () {
      const api = Config.api;
      const defaultAggregate = `${api.scheme}${api.host}${api.routes['latest-statuses']}`;
      const pressReview = `${api.scheme}${api.host}${api.routes['press-review']}`;
      const vueJs = `${api.scheme}${api.host}${api.routes['vue-js']}`;
      const clojure = `${api.scheme}${api.host}${api.routes.clojure}`;
      const php = `${api.scheme}${api.host}${api.routes.php}`;
      const golang = `${api.scheme}${api.host}${api.routes.golang}`;
      const javascript = `${api.scheme}${api.host}${api.routes.javascript}`;
      const python = `${api.scheme}${api.host}${api.routes.python}`;
      const rust = `${api.scheme}${api.host}${api.routes.rust}`;
      const scala = `${api.scheme}${api.host}${api.routes.scala}`;

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
      };
    },
  },
};
