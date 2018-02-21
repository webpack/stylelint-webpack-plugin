'use strict';

var StyleLintPlugin = require('../../');
var webpack = require('./webpack');

module.exports = function (options) {
  var configFilePath = getPath('./.stylelintrc');
  const pluginOptions = Object.assign({ configFile: configFilePath }, options || {});

  var baseConfig = {
    entry: './index',
    output: {
      path: getPath('output')
    },
    plugins: [
      new StyleLintPlugin(pluginOptions)
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

  return baseConfig;
};
