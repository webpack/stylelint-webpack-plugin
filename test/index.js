'use strict';

var assign = require('object-assign');
var StyleLintPlugin = require('../');
var getChangedFiles = require('../lib/get-chaged-files');
var pack = require('./helpers/pack');
var webpack = require('./helpers/webpack');
var baseConfig = require('./helpers/base-config');

var configFilePath = getPath('./.stylelintrc');

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

    /*
     @TODO: come back later to integration tests
     @see https://github.com/vieron/stylelint-webpack-plugin/pull/53#discussion_r95084529
     Dependencies to install or include for following test:
          - `node-fs-extra`
          - `../helpers/watch`
          - `path`
     // Webpack integration test.
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

      var destSass = context + '/test-tmp.scss';
      var destJS = context + '/index.js';
      fsExtra.copySync(context + '/initial-index.js', destJS);
      fsExtra.copySync(context + '/initial-bad.scss', destSass);
      var stop = watch(assign({}, baseConfig, config), watchCallback);
      var runsCount = 0;

      function watchCallback(err, stats) {
        if (err) {
          return done(err);
        }

        // First watch run doesn't have any information in stats yet.
        // So, starting from 2nd.
        if (runsCount === 1) {
          // Check that there are no errors on initial run.
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);

          // Trigger watch build by updating JS file, should have no errors in next step
          fsExtra.copy(context + '/updated-index.js', destJS);
        } else
        if (runsCount === 2) {
          // Check that on JS file change styleling is not triggered.
          expect(stats.compilation.errors).to.have.length(0);
          expect(stats.compilation.warnings).to.have.length(0);

          // Trigger watch build by updating Sass file, should have errors in next step
          fsExtra.copy(context + '/updated-bad.scss', destSass);
        } else if (runsCount > 2) {
          stop();
          fsExtra.removeSync(destSass);
          fsExtra.removeSync(destJS);
          // Ensure that Sass file violates linting.
          expect(stats.compilation.warnings).to.have.length(1);
          expect(stats.compilation.errors).to.have.length(1);
          done();
        }
        runsCount++;
      }
    });
    */
  });

  context('getChangedFiles', function () {
    it('returns changed style files', function () {
      var plugin = {
        startTime: 10,
        prevTimestamps: {
          '/test/changed.scss': 5,
          '/test/removed.scss': 5,
          '/test/changed.js': 5
        }
      };
      var compilation = {
        fileTimestamps: {
          '/test/changed.scss': 20,
          '/test/changed.js': 20,
          '/test/newly-created.scss': 15
        }
      };
      var glob = '/**/*.scss';

      expect(getChangedFiles(plugin, compilation, glob)).to.eql([
        '/test/changed.scss',
        '/test/newly-created.scss'
      ]);
    });
  });
});
