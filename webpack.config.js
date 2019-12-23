const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'node', // Tells webpack not to replace node specific code with browser alternatives, since we're running the script in node
  entry: './index.js',
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname),
  },
  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.js',
    },
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }), // Add a shebang bannder that will be needed to execute the cli.js in a node environment
  ],
  node: { // Tells webpack not to replace __dirname and __filename, since we will be running the script in a node environment, not in the browser
    __dirname: false,
    __filename: false,
  },
};
