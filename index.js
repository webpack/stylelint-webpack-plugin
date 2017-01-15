'use strict';

// Dependencies
var path = require('path');
var arrify = require('arrify');
var assign = require('object-assign');
var formatter = require('stylelint').formatters.string;

// Modules
var runCompilation = require('./lib/run-compilation');
var LintDirtyModulesPlugin = require('./lib/lint-dirty-modules-plugin');

function apply (options, compiler) {
  options = options || {};
  var context = options.context || compiler.context;
  options = assign({
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
    new LintDirtyModulesPlugin(compiler, options); // eslint-disable-line no-new
  } else {
    compiler.plugin('run', runner);
    compiler.plugin('watch-run', function onWatchRun (watcher, callback) {
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
module.exports = function stylelintWebpackPlugin (options) {
  return {
    apply: apply.bind(this, options)
  };
};
