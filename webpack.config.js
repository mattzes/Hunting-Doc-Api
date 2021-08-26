const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'hunting-doc-api.js',
  },
  target: 'node',
  resolve: {
    extensions: ['.js'],
  },
  externals: [nodeExternals()],
};
