const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = merge(common, {
  //devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false
    }),
    new OptimizeCssAssetsPlugin()
  ]
});

module.exports = config;
