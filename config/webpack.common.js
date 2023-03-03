'use strict'

const path = require('path')
const glob = require('glob')

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const PATHS = require('./paths')

// Search entry files.
const entries = Object.fromEntries(
  glob
    .sync('{**/style.scss,**/index.{ts,js}}', {
      cwd: PATHS.src,
    })
    .map(function (entryPath) {
      const parsedEntryPath = path.parse(entryPath)
      return [
        path.join(parsedEntryPath.dir, parsedEntryPath.name),
        path.join(PATHS.src, entryPath),
      ]
    })
)
console.log('Entries:')
console.log(entries)

// To re-use webpack configuration across templates,
// CLI maintains a common webpack configuration file - `webpack.common.js`.
// Whenever user creates an extension, CLI adds `webpack.common.js` file
// in template's `config` folder
module.exports = {
  entry: entries,
  output: {
    // to clean up build folder
    clean: true,
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: '[name].js',
  },
  stats: {
    all: false,
    errors: true,
    builtAt: true,
  },
  module: {
    rules: [
      // Help webpack in understanding CSS files imported in .js files
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      // Check for images imported in .js files and
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
    },
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  plugins: [
    // Copy static common assets from `public/common` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public/common',
        },
      ],
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
}
