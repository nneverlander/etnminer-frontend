const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const config = merge(common, {
  devtool: 'cheap-eval-source-map',
  devServer: {
    contentBase: './public',
    hot: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()
  ]
});

module.exports = config;
