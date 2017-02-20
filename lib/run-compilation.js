'use strict';

var chalk = require('chalk');
var linter = require('./linter');
var errorMessage = require('./constants').errorMessage;

/**
 * Function bound to the plugin `apply` method to run the linter and report any
 * errors (and their source file locations)
 * @param options - from the apply method, the options passed in
 * @param compiler - the compiler object
 * @param done - webpack callback
 */
module.exports = function runCompilation (options, compiler, done) {
  var errors = [];
  var warnings = [];

  linter(options)
    .then(function linterSuccess (lint) {
      var results = lint.results;

      warnings = options.emitErrors === false ? results : results.filter(function (file) {
        return !file.errored && file.warnings && file.warnings.length;
      });

      errors = options.emitErrors === false ? [] : results.filter(function (file) {
        return file.errored;
      });

      if (options.quiet === false) {
        console.warn(options.formatter(results));
      }

      if (options.failOnError && errors.length) {
        done(new Error(errorMessage));
      } else {
        done();
      }
    })
    .catch(done);

  compiler.plugin('after-emit', function afterEmit (compilation, callback) {
    if (warnings.length) {
      compilation.warnings.push(chalk.yellow(options.formatter(warnings)));
      warnings = [];
    }

    if (errors.length) {
      compilation.errors.push(chalk.red(options.formatter(errors)));
      errors = [];
    }

    callback();
  });
};
