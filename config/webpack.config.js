'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    popup2: PATHS.src + '/popup2.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
    dropFile: PATHS.src + '/dropFile.js',
  },
});

module.exports = config;
