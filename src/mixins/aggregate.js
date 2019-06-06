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
    },
    sortAggregates(aggregates) {
      return Object.values(Object.entries(aggregates))
        .map(entries => {
          const [id, name] = entries;
          return {
            id,
            name
          };
        })
        .sort((leftAggregate, rightAggregate) => {
          if (leftAggregate.name === rightAggregate.name) {
            return 0;
          }

          if (leftAggregate.name > rightAggregate.name) {
            return 1;
          }

          return -1;
        });
    }
  }
};
