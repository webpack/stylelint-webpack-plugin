'use strict';
var minimatch = require('minimatch');
var reduce = require('lodash.reduce');
var assign = require('object-assign');
var runCompilation = require('./run-compilation');

/**
 * Binds callback with provided options and stores initial values.
 *
 * @param compiler - webpack compiler object
 * @param options - stylelint nodejs options
 * @param callback <function(options, compilitaion)> - callback to call on emit
 */
function LintDirtyModulesPlugin (compiler, options) {
  this.startTime = Date.now();
  this.prevTimestamps = {};
  this.isFirstRun = true;
  this.compiler = compiler;
  this.options = options;
  compiler.plugin('emit',
    this.lint.bind(this) // bind(this) is here to prevent context overriding by webpack
  );
}

/**
 * Lints changed files provided by compilation object.
 * Fully executed only after initial run.
 *
 * @param options - stylelint options
 * @param compilation - webpack compilation object
 * @param callback - to be called when execution is done
 * @returns {*}
 */
LintDirtyModulesPlugin.prototype.lint = function (compilation, callback) {
  if (this.isFirstRun) {
    this.isFirstRun = false;
    this.prevTimestamps = compilation.fileTimestamps;
    return callback();
  }
  var dirtyOptions = assign({}, this.options);
  var glob = dirtyOptions.files.join('|');
  var changedFiles = this.getChangedFiles(compilation.fileTimestamps, glob);
  this.prevTimestamps = compilation.fileTimestamps;
  if (changedFiles.length) {
    dirtyOptions.files = changedFiles;
    runCompilation.call(this, dirtyOptions, this.compiler, callback);
  } else {
    callback();
  }
};

/**
 * Returns an array of changed files comparing current timestamps
 * against cached timestamps from previous run.
 *
 * @param plugin - stylelint-webpack-plugin this scopr
 * @param fileTimestamps - an object with keys as filenames and values as their timestamps.
 * e.g. {'/filename.scss': 12444222000}
 * @param glob - glob pattern to match files
 */
LintDirtyModulesPlugin.prototype.getChangedFiles = function (fileTimestamps, glob) {
  return reduce(fileTimestamps, function (changedStyleFiles, timestamp, filename) {
    // Check if file has been changed first ...
    if ((this.prevTimestamps[filename] || this.startTime) < (fileTimestamps[filename] || Infinity) &&
      // ... then validate by the glob pattern.
      minimatch(filename, glob, {matchBase: true})
    ) {
      changedStyleFiles = changedStyleFiles.concat(filename);
    }
    return changedStyleFiles;
  }.bind(this), []);
};

module.exports = LintDirtyModulesPlugin;
