import Raven from 'raven-js';

import Config from '../config';

const developmentMode = false;
const productionMode = !developmentMode;

const environmentParameters = {
  developmentMode: developmentMode,
  mobileMode: true,
  productionMode: !developmentMode,
  testMode: false,
};

const getEnvironmentParameters = () => environmentParameters;

const environmentProvider = { getEnvironmentParameters };
const api = Config.getApi(environmentProvider);
const apiMixin = {
  computed: {
    routes: function () {
      return {
        defaultAggregate: `${api.scheme}${api.host}${api.routes['press-review']}`,
      };
    },
  },
};

environmentParameters.test = {
  apiMixin,
};

const isDevelopmentModeActive = () => (getEnvironmentParameters().developmentMode);
const isProductionModeActive = () => (getEnvironmentParameters().productionMode);
const isTestModeActive = () => (getEnvironmentParameters().testMode);

const disableTestMode = () => {
  getEnvironmentParameters().developmentMode = true;
  getEnvironmentParameters().mobileMode = false;
  getEnvironmentParameters().productionMode = false;
  getEnvironmentParameters().testMode = false;
};

const enableTestMode = () => {
  getEnvironmentParameters().developmentMode = false;
  getEnvironmentParameters().productionMode = true;
  getEnvironmentParameters().mobileMode = false;
  getEnvironmentParameters().testMode = true;
};

const toggleTestMode = () => {
  if (!isTestModeActive()) {
    enableTestMode();

    return;
  }

  disableTestMode();
};

getEnvironmentParameters().toggleTestMode = toggleTestMode;

let defaultAggregate = 'defaultAggregate';
if (isProductionModeActive() || isTestModeActive()) {
  defaultAggregate = 'pressReview';
}

const REQUIRED_COLLECTION = 'Empty aggregate';

const errors = {
  REQUIRED_COLLECTION,
};

const state = {
  useFetch: false,
  actions: {
    fetchedLatestStatusesOfAggregate: null,
  },
  defaultAggregate: defaultAggregate,
  visibleStatuses: {
    statuses: [],
    name: defaultAggregate,
  },
};

const logLevel = {
  isSilent: false,
  onError: function () {},
};

const logger = {
  info(message, file, extra) {
    if (logLevel.isSilent) {
      return;
    }

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
    logLevel.onError({ error, file, extra });

    if (logLevel.isSilent) {
      return;
    }

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
  disableTestMode,
  enableTestMode,
  errors,
  getEnvironmentParameters,
  isDevelopmentModeActive,
  isProductionModeActive,
  isTestModeActive,
  logger,
  logLevel,
  state,
};
