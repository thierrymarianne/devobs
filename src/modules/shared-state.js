import Raven from 'raven-js';

const developmentMode = false;
const mobileMode = true;
const productionMode = !developmentMode;

let defaultAggregate = 'defaultAggregate';
if (productionMode) {
  defaultAggregate = 'pressReview';
}

const state = {
  mobileMode: mobileMode,
  productionMode: productionMode,
  useFetch: false,
  actions: {
    fetchedLatestStatusesOfAggregate: null,
  },
  defaultAggregate: defaultAggregate,
  visibleStatuses: {
    statuses: [],
    name: defaultAggregate,
  },
  log(message, file, extra) {
    if (productionMode) {
      Raven.captureMessage(
        message,
        {
          level: 'info',
          logger: file,
          extra,
        },
      );
      return;
    }

    console.info({ message, file, extra });
  },
  error(error, file, extra) {
    if (productionMode) {
      Raven.captureException(
        error,
        {
          logger: file,
          extra,
        },
      );
      return;
    }

    console.error({ error, file, extra });
    throw error;
  },
};

export default {
  state,
};
