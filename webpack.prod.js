const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = merge(common, {
  entry: {
    index: './src/js/index.js',
    miner: './src/js/miner.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js'
  },
  //devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
    new OptimizeCssAssetsPlugin()
  ]
});

module.exports = config;
