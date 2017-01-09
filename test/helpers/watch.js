'use strict';

var MemoryFileSystem = require('memory-fs');
var webpack = require('./webpack');

/**
 * Webpack watch in memory compiler
 * @param testConfig - the plugin config being tested run through the webpack compiler
 * @param watchCallback - on watch event callback passed to compiler
 * @return {Function} - function to be called when watch task should stop
 */
module.exports = function watch(testConfig, watchCallback) {
  var compiler = webpack(testConfig);
  compiler.outputFileSystem = new MemoryFileSystem();
  var watching = compiler.watch({}, watchCallback);
  return function done() {
    watching.close();
  };
};
