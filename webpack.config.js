const path = require('path');
const GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = {
  mode: "development",
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/superauto.js'
  },
  plugins: [
    new GitRevisionPlugin()
  ],
  devServer: {
    contentBase: './dist',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};