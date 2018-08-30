export default {
  methods: {
    declareAggregateTypesFromRoutes: (routes) => {
      const aggregateTypes = {};
      Object.keys(routes).forEach((aggregateType) => {
        aggregateTypes[aggregateType] = {
          statuses: [],
          isVisible: false,
          name: aggregateType,
        };
      });
      return aggregateTypes;
    },
  },
};
