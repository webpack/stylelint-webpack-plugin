const path = require('path');
const assign = require('object-assign');
const td = require('testdouble');
const StyleLintPlugin = require('../');
const { errorMessage } = require('../lib/constants');
const pack = require('./helpers/pack');
const webpack = require('./helpers/webpack');
const baseConfig = require('./helpers/base-config');

const configFilePath = getPath('./.stylelintrc');

describe('stylelint-webpack-plugin', () => {
  beforeEach(() => {
    td.replace(console, 'warn', td.function());
  });

  afterEach(() => {
    // See https://github.com/JaKXz/stylelint-webpack-plugin/issues/61
    td.verify(console.warn(), { times: 0, ignoreExtraArgs: true });
    td.reset();
  });

  it('works with a simple file', () =>
    pack(
      assign({}, baseConfig, {
        context: path.resolve('./test/fixtures/lint-free'),
      })
    ).then((stats) => {
      expect(stats.compilation.errors).to.have.length(0);
      expect(stats.compilation.warnings).to.have.length(0);
    }));

  it('sends errors to the errors output only', () =>
    pack(
      assign({}, baseConfig, {
        context: path.resolve('./test/fixtures/single-error'),
      })
    ).then((stats) => {
      expect(stats.compilation.errors).to.have.length(
        1,
        'should have one error'
      );
      expect(stats.compilation.warnings).to.have.length(
        0,
        'should have no warnings'
      );
    }));

  it('works with multiple source files', () =>
    pack(
      assign({}, baseConfig, {
        context: path.resolve('./test/fixtures/multiple-sources'),
      })
    ).then((stats) => {
      expect(stats.compilation.errors).to.have.length(1);
      expect(stats.compilation.errors[0]).to.be.an.instanceof(Error);
      expect(stats.compilation.errors[0].message).to.contain(
        'test/fixtures/multiple-sources/_second.scss'
      );
      expect(stats.compilation.errors[0].message).to.contain(
        'test/fixtures/multiple-sources/test.scss'
      );
    }));

  it('sends warnings properly', () =>
    pack(
      assign({}, baseConfig, {
        context: path.resolve('./test/fixtures/rule-warning'),
      })
    ).then((stats) => {
      expect(stats.compilation.errors).to.have.length(0);
      expect(stats.compilation.warnings).to.have.length(1);
    }));

  it('fails on errors when asked to', () => {
    const config = {
      context: path.resolve('./test/fixtures/single-error'),
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          failOnError: true,
        }),
      ],
    };

    return pack(assign({}, baseConfig, config))
      .then(expect.fail)
      .catch((err) => {
        expect(err.message).to.equal(errorMessage);
      });
  });

  it('fails when .stylelintrc is not a proper format', () => {
    const config = {
      context: path.resolve('./test/fixtures/single-error'),
      plugins: [
        new StyleLintPlugin({
          configFile: getPath('./.badstylelintrc'),
        }),
      ],
    };

    return pack(assign({}, baseConfig, config))
      .then(expect.fail)
      .catch((err) => {
        expect(err.message)
          .to.contain('Failed to parse')
          .and.contain('as JSON');
      });
  });

  context('without StyleLintPlugin configuration', () => {
    const config = {
      plugins: [new StyleLintPlugin()],
    };

    it('works by using stylelint#cosmiconfig under the hood', () =>
      pack(
        assign({}, baseConfig, config, {
          context: path.resolve('./test/fixtures/lint-free'),
        })
      ).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      }));

    it('finds the right stylelintrc', () =>
      pack(
        assign({}, baseConfig, config, {
          context: path.resolve('./test/fixtures/rule-warning'),
        })
      ).then((stats) => {
        expect(stats.compilation.warnings).to.have.length(1);
      }));
  });

  context('interop with NoErrorsPlugin', () => {
    it('works when failOnError is false', () => {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
          }),
        ],
      };

      if (webpack.NoErrorsPlugin) {
        config.plugins.push(new webpack.NoErrorsPlugin());
      }

      return pack(assign({}, baseConfig, config)).then((stats) => {
        expect(stats.compilation.errors).to.have.length(1);
      });
    });

    context('when failOnError is true', () => {
      const config = {
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            failOnError: true,
          }),
        ],
      };

      if (webpack.NoErrorsPlugin) {
        config.plugins.push(new webpack.NoErrorsPlugin());
      }

      it('throws when there is an error', () =>
        pack(
          assign({}, baseConfig, config, {
            context: path.resolve('./test/fixtures/single-error'),
          })
        )
          .then(expect.fail)
          .catch((err) => {
            expect(err).to.be.instanceof(Error);
          }));

      it('does not throw when there are only warnings', () =>
        pack(
          assign({}, baseConfig, config, {
            context: path.resolve('./test/fixtures/rule-warning'),
          })
        ).then((stats) => {
          expect(stats.compilation.warnings).to.have.length(1);
        }));
    });
  });

  context('when `emitErrors` is disabled', () => {
    const config = {
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          emitErrors: false,
        }),
      ],
    };

    it('does not print warnings or errors when there are none', () =>
      pack(
        assign({}, baseConfig, config, {
          context: path.resolve('./test/fixtures/lint-free'),
        })
      ).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      }));

    it('emits errors as warnings when asked to', () =>
      pack(
        assign({}, baseConfig, config, {
          context: path.resolve('./test/fixtures/single-error'),
        })
      ).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(1);
        expect(stats.compilation.warnings[0]).to.be.an.instanceof(Error);
        expect(stats.compilation.warnings[0].message.length > 0).to.equal(true);
      }));

    it('still indicates that warnings are warnings, even when emitting errors as warnings too', () =>
      pack(
        assign({}, baseConfig, config, {
          context: path.resolve('./test/fixtures/rule-warning'),
        })
      ).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(1);
        expect(stats.compilation.warnings[0]).to.be.an.instanceof(Error);
        expect(stats.compilation.warnings[0].message.length > 0).to.equal(true);
      }));
  });

  context('lintDirtyModulesOnly flag is enabled', () => {
    it('skips linting on initial run', () => {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            lintDirtyModulesOnly: true,
          }),
        ],
      };

      return pack(assign({}, baseConfig, config)).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      });
    });

    it('still skips on initial run with `emitErrors` disabled', () => {
      const config = {
        context: path.resolve('./test/fixtures/single-error'),
        plugins: [
          new StyleLintPlugin({
            configFile: configFilePath,
            lintDirtyModulesOnly: true,
            emitErrors: false,
          }),
        ],
      };

      return pack(assign({}, baseConfig, config)).then((stats) => {
        expect(stats.compilation.errors).to.have.length(0);
        expect(stats.compilation.warnings).to.have.length(0);
      });
    });
  });
});
