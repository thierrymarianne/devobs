import Raven from "raven-js";

import Config from "../config";

const developmentMode = process.env.NODE_ENV !== "production";
const productionMode = !developmentMode;

const environmentParameters = {
  developmentMode: developmentMode,
  mobileMode: developmentMode,
  productionMode: !developmentMode,
  testMode: Config.testMode
};

const getEnvironmentParameters = () => environmentParameters;

const environmentProvider = { getEnvironmentParameters };

let apiMixin = {};

if (!Config.testMode) {
  const api = Config.getApi(environmentProvider);
  apiMixin = {
    computed: {
      routes: function() {
        return {
          pressReview: `${api.scheme}${api.host}${api.routes["press-review"]}`
        };
      }
    }
  };
}

const isProductionModeActive = () => getEnvironmentParameters().productionMode;
const isTestModeActive = () => getEnvironmentParameters().testMode;

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

  // Allow conditional import
  // @see https:// https://stackoverflow.com/a/46543835
  // and https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import/
  return true;
};

const toggleTestMode = () => {
  if (!isTestModeActive()) {
    enableTestMode();

    return;
  }

  disableTestMode();
};

getEnvironmentParameters().toggleTestMode = toggleTestMode;

const REQUIRED_COLLECTION = "Empty aggregate";

const errors = {
  REQUIRED_COLLECTION
};

const state = {
  maxStatusPerAggregateAtFirst: 5,
  loadingStatuses: true,
  visibleStatuses: {
    name: "press-review",
    originalCollection: [],
    statuses: []
  }
};

const logLevel = {
  isSilent: false,
  onError: () => {}
};

class Logger {
  constructor($sentry) {
    this.$sentry = $sentry;
  }

  info(message, file, extra) {
    if (logLevel.isSilent) {
      return;
    }

    if (productionMode) {
      this.$sentry.captureMessage(message, {
        level: "info",
        logger: file,
        extra
      });
    }
  }

  error(error, file, extra) {
    logLevel.onError({ error, file, extra });

    if (logLevel.isSilent) {
      return error;
    }

    if (productionMode) {
      this.$sentry.captureException(error, {
        logger: file,
        extra
      });
      return error;
    }

    return error;
  }
}

export default {
  errors,
  getEnvironmentParameters,
  isProductionModeActive,
  isTestModeActive,
  Logger,
  logLevel,
  state
};
