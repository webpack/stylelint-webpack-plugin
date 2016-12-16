'use strict';

var chalk = require('chalk');
var linter = require('./linter');

/**
 * Function bound to the plugin `apply` method to run the linter and report any
 * errors (and their source file locations)
 * @param options - from the apply method, the options passed in
 * @param compiler - the compiler object
 * @param done - webpack callback
 */
module.exports = function runCompilation(options, compiler, done) {
  var errors = [];
  var warnings = [];

  linter(options)
    .then(function linterSuccess(lint) {
      warnings = lint.results.filter(function (f) {
        return f.warnings && f.warnings.length;
      });

      errors = lint.results.filter(function (f) {
        return f.errored;
      });

      if (options.failOnError && errors.length) {
        done(new Error('Failed because of a stylelint error.\n'));
      } else {
        done();
      }
    })
    .catch(function linterError(err) {
      if (options.failOnError && errors.length) {
        done(new Error('Failed because of a stylelint error.\n'));
      } else {
        done();
      }
      console.log(chalk.red(err));
    });

  compiler.plugin('compilation', function onCompilation(compilation) {
    if (warnings.length) {
      compilation.warnings.push(chalk.yellow(options.formatter(warnings)));
      warnings = [];
    }

    if (errors.length) {
      compilation.errors.push(chalk.red(options.formatter(errors)));
      errors = [];
    }
  });
};
