import Config from "../config";
import SharedState from "../modules/shared-state";

const getApiMixin = () => {
  if (SharedState.isTestModeActive()) {
    SharedState.getEnvironmentParameters().test.apiMixin.mixins = [
      AggregateMixin
    ];
    return SharedState.getEnvironmentParameters().test.apiMixin;
  }

  return {
    computed: {
      routes: function() {
        const routePaths = Config.getRoutes();
        const schemeAndHost = Config.getSchemeAndHost();

        const routes = {};
        Object.keys(routePaths).forEach(routeName => {
          if (routeName === "actions") {
            return;
          }

          const path = routePaths[routeName];
          const routeIndex = routeName.replace(/\s+/g, "-").toLowerCase();
          routes[routeIndex] = {
            name: routeName,
            source: `${schemeAndHost}${path}`
          };
        });

        // Handle actions separately for more clarity
        routes.actions = routePaths.actions;

        return routes;
      }
    }
  };
};

const apiMixin = getApiMixin();

export default apiMixin;
