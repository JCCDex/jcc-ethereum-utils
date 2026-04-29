const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

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
    fallback: {
      fs: false,
      tls: false,
      child_process: false,
      net: false,
      buffer: require.resolve("buffer/")
    },
    alias: {
      scryptsy: path.resolve(__dirname, "node_modules/scryptsy"),
      "scrypt.js": path.resolve(__dirname, "node_modules/scrypt.js"),
      keccak: path.resolve(__dirname, "node_modules/keccak"),
      uuid: path.resolve(__dirname, "node_modules/uuid"),
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      "base-x": path.resolve(__dirname, "node_modules/base-x"),
      "eth-lib": path.resolve(__dirname, "node_modules/eth-lib"),
      "safe-buffer": path.resolve(__dirname, "node_modules/safe-buffer"),
      "js-sha3": path.resolve(__dirname, "node_modules/js-sha3"),
      inherits: path.resolve(__dirname, "node_modules/inherits"),
      "ethers/crypto": path.resolve(__dirname, "node_modules/ethers/lib.commonjs/crypto"),
      "ethers/transaction": path.resolve(__dirname, "node_modules/ethers/lib.commonjs/transaction"),
      "ethers/utils": path.resolve(__dirname, "node_modules/ethers/lib.commonjs/utils")
    },
    extensions: [".js", ".json", ".ts"]
  },
  mode: process.env.MODE === "dev" ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(cjs|mjs|js|jsx)$/,
        loader: "babel-loader"
      }
    ]
  },
  optimization: {
    minimize: process.env.MODE !== "dev",
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            sequences: true,
            dead_code: true,
            drop_console: true,
            drop_debugger: true,
            unused: true
          }
        },
        parallel: true
      })
    ]
  },
  plugins: [new DuplicatePackageCheckerPlugin(), new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] })]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
