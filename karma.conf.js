const path = require("path");
const webpackConfig = require("./webpack.config");

module.exports = function (config) {
  config.set({
    frameworks: ["browserify", "detectBrowsers", "mocha"],
    files: ["test/*.spec.js"],
    preprocessors: {
      "test/*.spec.js": ["webpack"]
    },
    singleRun: true,
    plugins: ["karma-webpack", "karma-browserify", "karma-chrome-launcher", "karma-env-preprocessor", "karma-firefox-launcher", "karma-detect-browsers", "karma-mocha"],
    webpack: {
      resolve: {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          // web3's prebuilt browser bundle (dist/web3.min.js) crashes at module init
          // with "Cannot convert a BigInt value to a number" inside @noble/curves
          // BLS12-381 code on web3 >= 4.x. Use the CommonJS build instead so webpack
          // bundles it itself, while all other packages still use their browser fields.
          web3$: path.resolve(__dirname, "node_modules/web3/lib/commonjs/index.js")
        }
      },
      plugins: webpackConfig.plugins,
      mode: "development",
      module: webpackConfig.module
    },
    envPreprocessor: ["RANDOM_TESTS_REPEAT"],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection(availableBrowser) {
        if (availableBrowser.includes("Chrome")) {
          return ["ChromeHeadless"];
        }

        var browsers = ["Chrome", "Firefox"];
        return browsers.filter(function (browser) {
          return availableBrowser.indexOf(browser) !== -1;
        });
      }
    }
  });
};
