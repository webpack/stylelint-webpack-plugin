'use strict';

// Dependencies
var path = require('path');
var arrify = require('arrify');
var assign = require('object-assign');
var minimatch = require('minimatch');
var formatter = require('stylelint').formatters.string;

// Modules
var runCompilation = require('./lib/run-compilation');

function apply(options, compiler) {
  options = options || {};
  var context = options.context || compiler.context;
  options = assign({
    configFile: '.stylelintrc',
    formatter: formatter,
    quiet: false
  }, options, {
    // Default Glob is any directory level of scss and/or sass file,
    // under webpack's context and specificity changed via globbing patterns
    files: arrify(options.files || '**/*.s?(c|a)ss').map(function (file) {
      return path.join(context, '/', file);
    }),
    context: context
  });

  var runner = runCompilation.bind(this, options);

  if (options.lintDirtyModulesOnly) {
    this.startTime = Date.now();
    this.prevTimestamps = {};
    var isFirstRun = true;

    compiler.plugin('emit', function (compilation, callback) {
      var dirtyOptions = assign({}, options);
      var globPatterb = dirtyOptions.files;

      var changedFiles = Object.keys(compilation.fileTimestamps).filter(function (watchfile) {
        return (this.prevTimestamps[watchfile] || this.startTime) < (compilation.fileTimestamps[watchfile] || Infinity);
      }.bind(this)).filter(minimatch.filter(globPatterb.join('|'), {matchBase: true}));

      this.prevTimestamps = compilation.fileTimestamps;

      if (!isFirstRun && changedFiles.length) {
        dirtyOptions.files = changedFiles;
        runCompilation.call(this, dirtyOptions, compiler, callback);
      } else {
        callback();
      }

      isFirstRun = false;
    }.bind(this));
  } else {
    compiler.plugin('run', runner);
    compiler.plugin('watch-run', function onWatchRun(watcher, callback) {
      runner(watcher.compiler, callback);
    });
  }
}

/**
 * Pass options to the plugin that get checked and updated before running
 * ref: https://webpack.github.io/docs/plugins.html#the-compiler-instance
 * @param options - from webpack config, see defaults in `apply` function.
 * @return {Object} the bound apply function
 */
module.exports = function stylelintWebpackPlugin(options) {
  return {
    apply: apply.bind(this, options)
  };
};
