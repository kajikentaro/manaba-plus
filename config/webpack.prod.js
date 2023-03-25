'use strict'

const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const { merge } = require('webpack-merge')
const ZipWebpackPlugin = require('zip-webpack-plugin')

const common = require('./webpack.common.js')

const buildPath = path.resolve('build')
const manifest = require('../src/manifest.json')

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
          /**
           * Remove debugging code like:
           *
           * ```
           * // #region DEBUG recording a log
           * console.log('Hello_World!')
           * // #endregion
           * ```
           */
          {
            loader: 'string-replace-loader',
            options: {
              search: /\/\/\s*?#region\s*DEBUG.*?\/\/\s*?#endregion.*?$/gms,
              replace: '',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Copy static production assets from `public/prod` folder to `dst` folder.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public/prod',
        },
      ],
    }),
    // Zip `dst` folder into zip file.
    new ZipWebpackPlugin({
      path: buildPath,
      filename: `${manifest.name}_${process.env.npm_package_version}.zip`,
      exclude: 'docs',
    }),
  ],
})
