const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
  entry: "./lib",
  output: {
    filename: "jcc-ethereum-utils.min.js",
    path: path.resolve(__dirname, "./dist"),
    library: "jcc_ethereum_utils",
    libraryTarget: "umd"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      "scryptsy": path.resolve(__dirname, "node_modules/scryptsy"),
      "scrypt.js": path.resolve(__dirname, "node_modules/scrypt.js"),
      "keccak": path.resolve(__dirname, "node_modules/keccak"),
      "uuid": path.resolve(__dirname, "node_modules/uuid"),
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      "base-x": path.resolve(__dirname, "node_modules/base-x"),
      "eth-lib": path.resolve(__dirname, "node_modules/web3-eth-accounts/node_modules/eth-lib")
    }
  },
  mode: process.env.MODE === "dev" ? 'development' : "production",
  node: {
    fs: "empty",
    tls: "empty",
    "child_process": "empty",
    net: "empty"
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/
    }]
  },
  plugins: [
    new DuplicatePackageCheckerPlugin()
  ]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin())
}

if (process.env.MODE !== "dev") {
  config.plugins.push(new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        sequences: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        unused: true
      }
    },
    sourceMap: false,
    parallel: true
  }));
}

module.exports = config;