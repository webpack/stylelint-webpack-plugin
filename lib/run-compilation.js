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
  var errors = [];
  var warnings = [];
  var compilerWebpack3Method = options.emitErrors ? 'after-compile' : 'after-emit';
  var compilerWebpack4Hook = options.emitErrors ? 'afterCompile' : 'afterEmit';

  linter(options)
    .then(function linterSuccess (lint) {
      var results = lint.results;

      if (options.emitErrors === false) {
        warnings = results.filter(R.either(fileHasErrors, fileHasWarnings));
      } else {
        warnings = results.filter(R.both(R.complement(fileHasErrors), fileHasWarnings));
        errors = results.filter(fileHasErrors);
      }

      if (options.failOnError && errors.length) {
        done(new Error(errorMessage));
      } else {
        done();
      }
    })
    .catch(done);

  const cb = function (compilation, next) {
    if (warnings.length) {
      compilation.warnings.push(new Error(options.formatter(warnings)));
      warnings = [];
    }

    if (errors.length) {
      compilation.errors.push(new Error(options.formatter(errors)));
      errors = [];
    }

    next();
  };

  if (compiler.hooks) {
    compiler.hooks[compilerWebpack4Hook].tapAsync('StylelintWebpackPlugin', cb);
  } else {
    compiler.plugin(compilerWebpack3Method, cb);
  }
};

function fileHasErrors (file) {
  return file.errored;
}

function fileHasWarnings (file) {
  return file.warnings && file.warnings.length;
}
