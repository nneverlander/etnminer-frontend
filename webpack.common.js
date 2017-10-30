const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = {
  entry: {
    index: './src/js/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /\.txt$/,
      use: 'raw-loader'
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
      use: ['file-loader']
    }]
  },
  plugins: [new ExtractTextPlugin("[name].css"),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
    }),
    new CleanWebpackPlugin(['publicasfsff']),
    new CopyWebpackPlugin([{
      from: './src/html/*',
      flatten: true,
      force: true,
      ignore: [{
        glob: '**/login'
      }]
    }, {
      from: './src/vid',
      to: 'vid',
      force: true
    }])
  ]
};

module.exports = config;
