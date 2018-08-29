import Config from '../config';
import SharedState from '../modules/shared-state';

const getApiMixin = () => {
  if (SharedState.isTestModeActive()) {
    return SharedState.getEnvironmentParameters().test.testApi;
  }

  return {
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
