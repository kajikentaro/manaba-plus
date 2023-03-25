'use strict'

const glob = require('glob')
const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

require('../pre/index')()

const srcPath = path.resolve('src')
const dstPath = path.resolve('dst')

// Search entry files.
const entries = Object.fromEntries(
  glob
    .sync('{**/style.scss,**/index.{ts,js}}', {
      cwd: srcPath,
    })
    .map(function (entryPath) {
      const parsedEntryPath = path.parse(entryPath)
      return [
        path.join(parsedEntryPath.dir, parsedEntryPath.name),
        path.join(srcPath, entryPath),
      ]
    })
)
console.log('Entries:')
console.log(entries)
console.log()

// Search .bug files.
console.log('Pugs:')
const pugs = glob
  .sync('**/index.pug', {
    cwd: srcPath,
  })
  .map(function (entryPath) {
    console.log(entryPath)
    const parsedEntryPath = path.parse(entryPath)
    return new HtmlWebpackPlugin({
      template: path.join(srcPath, entryPath),
      filename: path.join(parsedEntryPath.dir, parsedEntryPath.name + '.html'),
      minify: 'auto',
      inject: false,
    })
  })
console.log()

// To re-use webpack configuration across templates,
// CLI maintains a common webpack configuration file - `webpack.common.js`.
// Whenever user creates an extension, CLI adds `webpack.common.js` file
// in template's `config` folder.
module.exports = {
  entry: entries,
  output: {
    // to clean up dst folder
    clean: true,
    // the dst folder to output bundles and assets in
    path: dstPath,
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
      // Help webpack in understanding CSS files imported in .js files.
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      // Load .pug files with pug-loader.
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      },
      // Check for images imported in .js files.
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
    // Copy static common assets from `public/common` folder to `dst` folder.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public/common',
        },
        {
          from: 'manifest.json',
          context: 'src',
          transform: require('../pre/manifest'),
        },
      ],
    }),
    // Extract CSS into separate files.
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // Register .pug files for converting them into HTML.
    ...pugs,
  ],
}
