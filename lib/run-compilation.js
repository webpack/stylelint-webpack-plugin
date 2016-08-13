'use strict';

var chalk = require('chalk');
var linter = require('./linter');

/**
 * Function bound to the plugin `apply` method to run the linter and report any
 * errors (and their source file locations)
 * @param options - from the apply method, the options passed in
 * @param compilation - the compiler object
 * @param done - webpack callback
 */
module.exports = function runCompilation(options, compilation, done) {
  var errors = [];

  linter(options)
    .then(function (lint) {
      if (lint.errored) {
        errors = lint.results
          .filter(function (f) {
            return f.errored;
          })
          .map(function (f) {
            return f.source; // send error instead
          });

        if (!options.quiet) {
          console.log(chalk.yellow(options.formatter(lint.results)));
        }
      }

      if (options.failOnError && errors.length) {
        done(new Error('Failed because of a stylelint error.\n'));
      } else {
        done();
      }
    })
    .catch(function (err) {
      if (options.failOnError && errors.length) {
        done(new Error('Failed because of a stylelint error.\n'));
      } else {
        done();
      }
      console.log(chalk.red(err));
    });

  // eslint-disable-next-line no-unused-expressions
  compilation.plugin && compilation.plugin('compilation', function (compilation) {
    errors.forEach(function (err) {
      compilation.errors.push(err);
    });
  });
};
