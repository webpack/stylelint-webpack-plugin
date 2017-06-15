'use strict';

const assign = require('object-assign');
const path = require('path');
const td = require('testdouble');

const StyleLintPlugin = require('../');

const pack = require('./helpers/pack');
const webpack = require('./helpers/webpack');
const baseConfig = require('./helpers/base-config');
const configFilePath = getPath('./.stylelintrc');
const errorMessage = require('../lib/constants').errorMessage;

describe('stylelint-webpack-plugin', function () {
  it('works with a simple file', function () {
    return pack(assign({}, baseConfig, { context: path.resolve('./test/fixtures/lint-free') }))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      });
  });

  it('sends errors to the errors output only', function () {
    return pack(assign({}, baseConfig, { context: path.resolve('./test/fixtures/single-error') }))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1, 'should have one error');
        expect(stats.compilation.warnings).to.have.length(0, 'should have no warnings');
      });
  });

  it('works with multiple source files', function () {
    return pack(assign({}, baseConfig, { context: path.resolve('./test/fixtures/multiple-sources') }))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(1);
        expect(stats.compilation.errors[0]).to.contain('test/fixtures/multiple-sources/_second.scss');
        expect(stats.compilation.errors[0]).to.contain('test/fixtures/multiple-sources/test.scss');
      });
  });

  it('sends warnings properly', function () {
    return pack(assign({}, baseConfig, { context: path.resolve('./test/fixtures/rule-warning') }))
      .then(function (stats) {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(1);
      });
  });

  it('fails on errors when asked to', function () {
    const config = {
      context: path.resolve('./test/fixtures/single-error'),
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
        expect(err.message).to.equal(errorMessage);
      });
  });

  it('fails when .stylelintrc is not a proper format', function () {
    const config = {
      context: path.resolve('./test/fixtures/single-error'),
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

  context('iff quiet is strictly false', function () {
    beforeEach(function () {
      td.replace(console, 'warn', td.function());
    });

    afterEach(function () {
      td.reset();
    });

    it('sends messages to the console', function () {
      const config = {
        context: path.resolve('./test/fixtures/syntax-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: false
          })
        ]
      };

      return pack(assign({}, baseConfig, config))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(1);
          td.verify(console.warn(td.matchers.contains('✖')));
        });
    });
  });

  context('without StyleLintPlugin configuration', function () {
    const config = {
      plugins: [
        new StyleLintPlugin()
      ]
    };

    it('works by using stylelint#cosmiconfig under the hood', function () {
      return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/lint-free') }))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);
        });
    });

    it('finds the right stylelintrc', function () {
      return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/rule-warning') }))
        .then(function (stats) {
          expect(stats.compilation.warnings).to.have.length(1);
        });
    });
  });

  context('interop with NoErrorsPlugin', function () {
    it('works when failOnError is false', function () {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
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

    context('when failOnError is true', function () {
      const config = {
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true,
            failOnError: true
          }),
          new webpack.NoErrorsPlugin()
        ]
      };

      it('throws when there is an error', function () {
        return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/single-error') }))
          .then(expect.fail)
          .catch(function (err) {
            expect(err).to.be.instanceof(Error);
          });
      });

      it('does not throw when there are only warnings', function () {
        return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/rule-warning') }))
          .then(function (stats) {
            expect(stats.compilation.warnings).to.have.length(1);
          });
      });
    });
  });

  context('when `emitErrors` is disabled', function () {
    const config = {
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          quiet: true,
          emitErrors: false
        })
      ]
    };

    it('does not print warnings or errors when there are none', function () {
      return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/lint-free') }))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);
        });
    });

    it('emits errors as warnings when asked to', function () {
      return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/single-error') }))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(1);
          expect(stats.compilation.warnings[0]).to.contain('✖');
        });
    });

    it('still indicates that warnings are warnings, even when emitting errors as warnings too', function () {
      return pack(assign({}, baseConfig, config, { context: path.resolve('./test/fixtures/rule-warning') }))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(1);
          expect(stats.compilation.warnings[0]).to.contain('⚠');
        });
    });
  });

  context('lintDirtyModulesOnly flag is enabled', function () {
    it('skips linting on initial run', function () {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true,
            lintDirtyModulesOnly: true
          })
        ]
      };

      return pack(assign({}, baseConfig, config))
        .then(function (stats) {
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);
        });
    });

    it('still skips on initial run with `emitErrors` disabled', function () {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            quiet: true,
            lintDirtyModulesOnly: true,
            emitErrors: false
          })
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
