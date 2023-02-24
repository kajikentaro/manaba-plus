'use strict'

const CopyWebpackPlugin = require('copy-webpack-plugin')
const { merge } = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')

const PATHS = require('./paths')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    // Copy static production assets from `public/prod` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public/prod',
        },
      ],
    }),
    // Zip `build` folder into `build.zip`
    new ZipPlugin({
      path: PATHS.zip,
      filename: 'build.zip',
    }),
  ],
})
