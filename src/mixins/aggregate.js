export default {
  methods: {
    declareAggregateTypesFromRoutes: routes => {
      const aggregateTypes = {};
      Object.keys(routes).forEach(aggregateType => {
        if (aggregateType === 'actions') {
          return;
        }

        const aggregateIndex = aggregateType.replace(/\s+/g, '-').toLowerCase();
        aggregateTypes[aggregateIndex] = {
          statuses: [],
          isVisible: false,
          name: aggregateType
        };
      });

      aggregateTypes.bucket = {
        statuses: [],
        isVisible: false,
        name: 'bucket'
      };

      aggregateTypes.status = {
        statuses: [],
        isVisible: false,
        name: 'status'
      };

      return aggregateTypes;
    }
  }
};
