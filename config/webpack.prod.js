"use strict";

const ZipPlugin = require("zip-webpack-plugin");
const PATHS = require("./paths");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  plugins: [
    new ZipPlugin({
      path: PATHS.zip,
      filename: "build.zip",
    }),
  ],
});
