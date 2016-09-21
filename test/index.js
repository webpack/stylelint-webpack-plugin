'use strict';

var assign = require('object-assign');

var StyleLintPlugin = require('../');
var pack = require('./helpers/pack');

var configFilePath = getPath('./.stylelintrc');
var baseConfig = {
  debug: false,
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

describe('stylelint-webpack-plugin', function () {
  it('works with a simple file', function () {
    var config = {
      context: './test/fixtures/test1',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
      });
  });

  it('sends errors properly', function () {
    var config = {
      context: './test/fixtures/test3',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1);
      });
  });

  it('fails on errors when asked to', function () {
    var config = {
      context: './test/fixtures/test3',
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          quiet: true,
          failOnError: true
        })
      ]
    };

    expect(pack(assign({}, baseConfig, config)))
      .to.eventually.be.rejectedWith('Error: Failed because of a stylelint error.\n');
  });

  it('works with multiple source files', function () {
    var config = {
      context: './test/fixtures/test7',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(2);
      });
  });

  it('sends warnings properly', function () {
    var config = {
      context: './test/fixtures/test8',
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          quiet: true,
          configFile: configFilePath
        })
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.warnings).to.have.length(1);
      });
  });

  it('works without StyleLintPlugin configuration but posts warnign .stylelintrc file not found', function () {
    var config = {
      context: './test/fixtures/test9',
      entry: './index',
      plugins: [
        new StyleLintPlugin()
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      });
  });
});
