const MemoryFileSystem = require('memory-fs');
const webpack = require('./webpack');

/**
 * Basic in memory compiler, promisified
 * @param testConfig - the plugin config being tested run through the webpack compiler
 * @return {Promise} - rejects with both stats and the error if needed
 */
module.exports = function pack(testConfig) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(testConfig);
    compiler.outputFileSystem = new MemoryFileSystem();
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });
};
