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
  const hooks = {
    latest: 'afterEmit',
    legacy: 'after-emit'
  };

  if (options.emitErrors) {
    hooks.latest = 'afterCompile';
    hooks.legacy = 'after-compile';
  }

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

  const callback = (compilation, next) => {
    if (warnings.length) {
      compilation.warnings.push(new Error(options.formatter(warnings)));
      warnings = [];
    }

      problems[type] = [];
    }

    format('warnings');
    format('errors');
    next();
  };

  if (compiler.hooks) {
    compiler.hooks[hooks.latest].tapAsync('StylelintWebpackPlugin', callback);
  } else {
    compiler.plugin(hooks.legacy, callback);
  }
};

function fileHasErrors (file) {
  return file.errored;
}

function fileHasWarnings (file) {
  return file.warnings && file.warnings.length;
}
