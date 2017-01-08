'use strict';

var StyleLintPlugin = require('../../');
var webpack = require('./webpack');

var configFilePath = getPath('./.stylelintrc');

var baseConfig = {
  output: {
    path: getPath('output')
  },
  plugins: [
    new StyleLintPlugin({
      quiet: true,
      configFile: configFilePath
    })
  ]
};

if (typeof webpack.LoaderOptionsPlugin === 'undefined') {
  baseConfig.debug = false;
} else {
  baseConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({
      debug: false
    })
  );
}

module.exports = baseConfig;
