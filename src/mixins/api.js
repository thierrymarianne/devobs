import Config from '../config';
import SharedState from '../modules/shared-state';
import AggregateMixin from './aggregate';

const getApiMixin = () => {
  if (SharedState.isTestModeActive()) {
    SharedState.getEnvironmentParameters().test.apiMixin.mixins = [AggregateMixin];
    return SharedState.getEnvironmentParameters().test.apiMixin;
  }

  return {
    mixins: [AggregateMixin],
    computed: {
      routes: function () {
        const routePaths = Config.getRoutes();
        const schemeAndHost = Config.getSchemeAndHost();

        const routes = {};
        Object.keys(routePaths).forEach((routeName) => {
          const path = routePaths[routeName];
          routes[routeName] = `${schemeAndHost}${path}`;
        });

        return routes;
      },
    },
  };
};

const apiMixin = getApiMixin();

export default apiMixin;
