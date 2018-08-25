import Config from '../config';

export default {
  computed: {
    routes: function () {
      const api = Config.api;
      const showLatestStatuses = `${api.scheme}${api.host}${api.routes['latest-statuses']}`;
      console.log(showLatestStatuses);

      return {
        showLatestStatuses,
      };
    },
  },
};
