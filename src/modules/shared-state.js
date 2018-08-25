import Raven from 'raven-js';

const developmentMode = false;

const productionMode = !developmentMode;
const state = {
  productionMode: productionMode,
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
