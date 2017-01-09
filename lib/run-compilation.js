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
      var results = lint.results;

      warnings = results.filter(function (file) {
        return !file.errored && file.warnings && file.warnings.length;
      });

      errors = results.filter(function (file) {
        return file.errored;
      });

      if (!options.quiet) {
        console.log(chalk.yellow(options.formatter(results)));
      }

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
