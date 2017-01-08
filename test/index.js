'use strict';

var path = require('path');
var assign = require('object-assign');
var webpack = require('webpack');
var fsExtra = require('node-fs-extra');

var StyleLintPlugin = require('../');
var pack = require('./helpers/pack');
var watch = require('./helpers/watch');

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

  it.skip('fails when .stylelintrc is not a proper format', function () {
    var badConfigFilePath = getPath('./.badstylelintrc');
    var config = {
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          configFile: badConfigFilePath
        })
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
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
      .to.eventually.be.rejectedWith('Failed because of a stylelint error.\n');
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

  it('send messages to console when css file with errors and quiet props set to false', function () {
    var config = {
      context: './test/fixtures/test10',
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath
        })
      ]
    };

    return pack(assign({}, baseConfig, config))
      .then(function (stats) {
        expect(stats.compilation.warnings).to.have.length(1);
        expect(stats.compilation.errors).to.have.length(1);
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
        });
    });
    it('lints only changed files in watch mode', function (done) {
      this.timeout(5000);
      var context = path.resolve(__dirname, 'fixtures/lint-dirty-files');
      var config = {
        context: context,
        entry: './index',
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            lintDirtyModulesOnly: true
          })
        ]
      };

      var dest = context + '/test-tmp.scss';
      fsExtra.copySync(context + '/initial-bad.scss', dest);
      var stop = watch(assign({}, baseConfig, config), watchCallback);
      var runsCount = 0;

      function watchCallback(err, stats) {
        if (err) {
          return done(err);
        }
        if (runsCount === 1) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);

          // async file update with 400ms delay,
          // so webpack can handle file udpate after initial run
          fsExtra.copy(context + '/updated-bad.scss', dest);
        } else if (runsCount > 1) {
          stop();
          fsExtra.removeSync(dest);
          // changed file should fail
          expect(stats.compilation.warnings).to.have.length(1);
          expect(stats.compilation.errors).to.have.length(1);
          done();
        }
        runsCount++;
      }
    });
  });
});
