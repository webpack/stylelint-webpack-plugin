'use strict';

var assign = require('object-assign');
var StyleLintPlugin = require('../');
var pack = require('./helpers/pack');
var webpack = require('./helpers/webpack');
var baseConfig = require('./helpers/base-config');

var configFilePath = getPath('./.stylelintrc');
require('./lib/lint-dirty-modules-plugin');

describe('stylelint-webpack-plugin', function () {
  it('works with a simple file', function () {
    var config = {
      context: './test/fixtures/test1',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      });
  });

  it('sends errors to the errors output only', function () {
    var config = {
      context: './test/fixtures/test3',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1, 'should have one error');
        expect(stats.compilation.warnings).to.have.length(0, 'should have no warnings');
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

    return pack(assign({}, baseConfig, config))
      .then(expect.fail)
      .catch(function (err) {
        expect(err.message).to.equal('Failed because of a stylelint error.\n');
      });
  });

  it('works with multiple source files', function () {
    var config = {
      context: './test/fixtures/test7',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1);
        expect(stats.compilation.errors[0]).to.contain('test/fixtures/test7/_second.scss');
        expect(stats.compilation.errors[0]).to.contain('test/fixtures/test7/test.scss');
      });
  });

  it('sends warnings properly', function () {
    var config = {
      context: './test/fixtures/rule-warning',
      entry: './index'
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(1);
      });
  });

  it('works without StyleLintPlugin configuration but posts warning .stylelintrc file not found', function () {
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

  // TODO use snapshots to ensure something is printed to the console
  it.skip('sends messages to console when quiet prop set to false', function () {
    var config = {
      context: './test/fixtures/syntax-error',
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          quiet: true
        })
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1);
        expect(stats.compilation.warnings).to.have.length(0);
      });
  });

  context('interop with NoErrorsPlugin', function () {
    it('works when failOnError is false', function () {
      var config = {
        context: './test/fixtures/test3',
        entry: './index',
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true
          }),
          new webpack.NoErrorsPlugin()
        ]
      };

      return pack(assign({}, baseConfig, config))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(1);
        });
    });

    it('throws when failOnError is true', function () {
      var config = {
        context: './test/fixtures/test3',
        entry: './index',
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true,
            failOnError: true
          }),
          new webpack.NoErrorsPlugin()
        ]
      };

      return pack(assign({}, baseConfig, config))
        .catch(function (err) {
          expect(err).to.be.instanceof(Error);
        });
    });
  });

  it('fails when .stylelintrc is not a proper format', function () {
    var config = {
      entry: './index',
      context: './test/fixtures/test3',
      plugins: [
        new StyleLintPlugin({
          configFile: getPath('./.badstylelintrc'),
          quiet: true
        })
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(expect.fail)
      .catch(function (err) {
        expect(err.message).to.contain('Failed to parse').and.contain('as JSON');
      });
  });

  context('lintDirtyModulesOnly flag is enabled', function () {
    it('skips linting on initial run', function () {
      var config = {
        context: './test/fixtures/test3',
        entry: './index',
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true,
            lintDirtyModulesOnly: true
          }),
          new webpack.NoErrorsPlugin()
        ]
      };

      return pack(assign({}, baseConfig, config))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);
        });
    });
  });
});
