/* eslint no-unused-expressions: 0 */

'use strict';

var assign = require('object-assign');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');

// _dirname is the test directory
var StyleLintPlugin = require(getPath('../index'));

var outputFileSystem = new MemoryFileSystem();

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

/**
 * This is the basic in-memory compiler
 */
function pack(testConfig, callback) {
  var compiler = webpack(testConfig);
  compiler.outputFileSystem = outputFileSystem;
  compiler.run(callback);
}

describe('sasslint-loader', function () {
  it('works with a simple file', function (done) {
    var config = {
      context: './test/fixtures/test1',
      entry: './index'
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors).to.have.length(0);
      expect(stats.compilation.warnings).to.have.length(0);
      done(err);
    });
  });

  it('sends errors properly', function (done) {
    var config = {
      context: './test/fixtures/test3',
      entry: './index',
      plugins: [new StyleLintPlugin({
        quiet: true,
        configFile: configFilePath
      })]
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors).to.have.length(1);
      done(err);
    });
  });

  it('fails on errors', function () {
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

    return expect(new Promise(function (resolve, reject) {
      var compiler = webpack(assign({}, baseConfig, config));
      compiler.outputFileSystem = outputFileSystem;
      compiler.run(function (err) {
        reject(err);
      });
    })).to.eventually.be.rejectedWith('Error: Failed because of a stylelint error.\n');
  });

  it('can specify a JSON config file via config', function (done) {
    var config = {
      context: './test/fixtures/test5',
      entry: './index',
      plugins: [
        new StyleLintPlugin({
          configFile: configFilePath,
          quiet: true
        })
      ]
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors.length).to.equal(0);
      done(err);
    });
  });

  it('should work with multiple files', function (done) {
    var config = {
      context: './test/fixtures/test7',
      entry: './index'
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors.length).to.equal(2);
      done(err);
    });
  });

  // it('should work with multiple context', function(done) {
  //   var config = {
  //     context: './test/fixtures/test5',
  //     entry: './index',
  //     plugins: [ new StyleLintPlugin({
  //       configFile: configFilePath,
  //       context: ['./test/testFiles/test5', './test/testFiles/test7']
  //     })]
  //   };

  //   pack(assign({}, baseConfig, config), function (err, stats) {
  //     expect(err).to.not.exist;
  //     expect(stats.compilation.errors.length).to.equal(0);
  //     expect(stats.compilation.warnings.length).not.to.equal(0);
  //     done(err);
  //   });
  // });
});
