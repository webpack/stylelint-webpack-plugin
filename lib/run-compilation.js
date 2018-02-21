'use strict';

var R = require('ramda');
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
  var compilerMethod = options.emitErrors ? 'after-compile' : 'after-emit';
  const problems = { errors: [], warnings: [] };

  linter(options)
    .then(function linterSuccess (lint) {
      var results = lint.results;

      if (options.emitErrors === false) {
        problems.warnings = results.filter(R.either(fileHasErrors, fileHasWarnings));
      } else {
        problems.warnings = results.filter(R.both(R.complement(fileHasErrors), fileHasWarnings));
        problems.errors = results.filter(fileHasErrors);
      }

      if (options.failOnError && problems.errors.length) {
        done(new Error(errorMessage));
      } else {
        done();
      }
    })
    .catch(done);

  compiler.plugin(compilerMethod, function (compilation, next) {
    function format (type) {
      if (!problems[type].length) {
        return;
      }

      let formatted = options.formatter(problems[type]);

      if (Array.isArray(formatted)) {
        for (const item of formatted) {
          compilation[type].push(item);
        }
      } else {
        compilation[type].push(new Error(formatted));
      }

      problems[type] = [];
    }

    format('warnings');
    format('errors');
    next();
  });
};

function fileHasErrors (file) {
  return file.errored;
}

function fileHasWarnings (file) {
  return file.warnings && file.warnings.length;
}
