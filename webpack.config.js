const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: "production",
  entry: './demo/js/main.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'main.js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.ttf$/,
      use: ['file-loader']
    }]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages:["typescript", "json"],
      features:["coreCommands","find"]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'demo/index.html'
    })
  ]
};