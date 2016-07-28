'use strict';

// Dependencies
var path = require('path');
var assign = require('object-assign');
var formatter = require('stylelint/dist/formatters/stringFormatter').default;
var arrify = require('arrify');

// Modules
var runCompilation = require('./lib/run-compilation');

function apply(options, compiler) {
  var context = options.context || compiler.context;

  options = Object.assign({}, options, {
    // TODO: make it work with arrays
    files: options.files.map(function (file) {
      return path.join(context, '/', file);
    })
  });

  compiler.plugin('run', runCompilation.bind(this, options));
  compiler.plugin('watch-run', runCompilation.bind(this, options));
}

// makes it easier to pass and check options to the plugin thank you webpack doc
// [https://webpack.github.io/docs/plugins.html#the-compiler-instance]
module.exports = function (options) {
  return {
    apply: apply.bind(this, buildOptions(options))
  };
};

function buildOptions(options) {
  return assign({
    configFile: '.stylelintrc',
    formatter: formatter,
    quiet: false
  }, options, {
    // Default Glob is any directory level of scss and/or sass file,
    // under webpack's context and specificity changed via globbing patterns
    files: arrify(options.files || '**/*.s?(c|a)ss')
  });
}
