'use strict';
var minimatch = require('minimatch');
var reduce = require('lodash.reduce');

/**
 * Returns an array of changed files comparing current timestamps
 * against cached timestamps from previous run.
 *
 * @param plugin - stylelint-webpack-plugin this scopr
 * @param compilation
 * @param glob
 */
module.exports = function getChangedFiles(plugin, compilation, glob) {
  return reduce(compilation.fileTimestamps, function (changedStyleFiles, timestamp, filename) {
    // Check if file has been changed first ...
    if ((plugin.prevTimestamps[filename] || plugin.startTime) < (compilation.fileTimestamps[filename] || Infinity) &&
      // ... then validate by the glob pattern.
      minimatch(filename, glob, {matchBase: true})
    ) {
      changedStyleFiles = changedStyleFiles.concat(filename);
    }
    return changedStyleFiles;
  }, []);
};
