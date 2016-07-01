// Dependencies
var loaderUtils = require('loader-utils');
var assign = require('object-assign');
var path = require('path');
var formatter = require('stylelint/dist/formatters/stringFormatter').default;
var chalk = require('chalk');

// Modules
var linter = require('./lib/linter');

function apply(options, compiler) {
  var context = options.context || compiler.context;
  var errors = [];

  options = Object.assign({}, options, {
    // TODO: make it work with arrays
    files: options.files.map(function(file) {
      return path.join(context, '/', file);
    })
  });

  function runCompilation(compilation, done) {
    linter(options).then(function(lint) {
      if (lint.errored) {
        errors = lint.results.filter(function(f) {
          return f.errored;
        }).map(function(f) {
          return f.source; // send error instead
        });

        (options.quiet !== true) && console.log(chalk.yellow(options.formatter(lint.results)));
      }

      if (options.failOnError && errors.length) {
          done(new Error('Failed because of a stylelint error.\n'));
      } else {
        done();
      }
    }).catch(function(e) {
       if (options.failOnError && errors.length) {
           done(new Error('Failed because of a stylelint error.\n'));
       } else {
         done();
       }
       console.log(chalk.red(e));
    });

    compilation.plugin && compilation.plugin('compilation', function(compilation) {
        errors.forEach(function(err) {
          if (options.failOnError && errors.length) {
            compilation.errors.push(err);
          }
        });
    });
  }

  compiler.plugin('run', runCompilation);
  compiler.plugin('watch-run', runCompilation);
}

// makes it easier to pass and check options to the plugin thank you webpack doc
// [https://webpack.github.io/docs/plugins.html#the-compiler-instance]
module.exports = function(options) {
  options = options || {};
  // Default Glob is any directory level of scss and/or sass file,
  // under webpack's context and specificity changed via globbing patterns
  options.files = options.files || '**/*.s?(c|a)ss';
  !Array.isArray(options.files) && (options.files = [options.files]);
  options.configFile = options.configFile || '.stylelintrc';
  options.formatter = options.formatter || formatter;
  options.quiet = options.quiet || false;

  return {
    apply: apply.bind(this, options)
  };
};