process.env.CHROME_BIN = require('puppeteer').executablePath();
const webpackConfig = require('../webpack.config.js');

const coverageReporter = {
  dir: '../coverage',
  reporters: [
    { type: 'lcov', subdir: '.' },
    { type: 'text-summary' },
    { type:'json', subdir: '.' },
  ]
};

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      '**/*.spec.js',
    ],
    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    reporters: ['spec', 'coverage'],
    coverageReporter: coverageReporter,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
  })
};
