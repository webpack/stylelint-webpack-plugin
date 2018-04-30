const StyleLintPlugin = require('../../');
const webpack = require('./webpack');

const configFilePath = getPath('./.stylelintrc');

module.exports = function (options) {
  const configFilePath = getPath('./.stylelintrc');
  const pluginOptions = Object.assign({ configFile: configFilePath }, options || {});

  const baseConfig = {
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


if (process.env.WEBPACK_VERSION === '4') {
  baseConfig.mode = 'development';
}

module.exports = baseConfig;
