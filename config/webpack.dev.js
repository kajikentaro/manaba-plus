'use strict'

const CopyWebpackPlugin = require('copy-webpack-plugin')
const { merge } = require('webpack-merge')

const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  // Expand source code into the compiled file.
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
  plugins: [
    // Copy static debug assets from `public/dev` folder to `dst` folder.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public/dev',
        },
      ],
    }),
  ],
})
