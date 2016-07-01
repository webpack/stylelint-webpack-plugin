/* global __dirname, describe, it */
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var assign = require('object-assign');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

chai.use(chaiAsPromised);

// _dirname is the test directory
var styleLintPlugin = require(path.join(__dirname, '../index'));

var outputFileSystem = new MemoryFileSystem();

var configFilePath = path.join(__dirname, './.stylelintrc');
var baseConfig = {
  debug: false,
  output: {
    path: path.join(__dirname, 'output')
  },
  plugins: [
    new styleLintPlugin({
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


/**
 * Test Suite
 */
describe('sasslint-loader', function () {
  it('works with a simple file', function (done) {
    var config = {
      context: './test/testfiles/test1',
      entry: './index'
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors.length).to.equal(0);
      expect(stats.compilation.warnings.length).to.equal(0);
      done(err);
    });
  });

  it('sends errors properly', function (done) {
    var config = {
      context: './test/testfiles/test3',
      entry: './index',
      plugins: [ new styleLintPlugin({
        quiet: true,
        configFile: configFilePath,
        failOnError: true
      })]
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors.length).to.equal(1);
      done(err);
    });
  });

  it('fails on errors', function () {
    var config = {
      context: './test/testfiles/test3',
      entry: './index',
      plugins: [ new styleLintPlugin({
        configFile: configFilePath,
        quiet: true,
        failOnError: true
      })]
    };

    return expect(new Promise(function(resolve, reject) {
      var compiler = webpack(assign({}, baseConfig, config));
      compiler.outputFileSystem = outputFileSystem;
      compiler.run(function(err) {
        reject(err);
      });
    })).to.eventually.be.rejectedWith('Error: Failed because of a stylelint error.\n');
  });

  it('can specify a JSON config file via config', function (done) {
    var config = {
      context: './test/testfiles/test5',
      entry: './index',
      plugins: [ new styleLintPlugin({
        configFile: configFilePath,
        quiet: true
      })]
    };

    pack(assign({}, baseConfig, config), function (err, stats) {
      expect(err).to.not.exist;
      expect(stats.compilation.errors.length).to.equal(0);
      done(err);
    });
  });

  it('should work with multiple files', function(done) {
    var config = {
      context: './test/testfiles/test7',
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
  //     context: './test/testfiles/test5',
  //     entry: './index',
  //     plugins: [ new styleLintPlugin({
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