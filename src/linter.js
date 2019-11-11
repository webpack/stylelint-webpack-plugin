import StylelintError from './StylelintError';

export default function linter(options, compiler, callback) {
  let errors = [];
  let warnings = [];

  // eslint-disable-next-line
  const { lint } = require(options.stylelintPath);

  lint(options)
    .then(({ results }) => {
      ({ errors, warnings } = parseResults(options, results));

      if (options.failOnError && errors.length) {
        callback(StylelintError.format(options, errors));
      } else if (options.failOnWarning && warnings.length) {
        callback(StylelintError.format(options, warnings));
      } else {
        callback();
      }
    })
    .catch(callback);

  compiler.hooks.afterCompile.tapAsync(
    'StylelintWebpackPlugin',
    (compilation, next) => {
      if (warnings.length) {
        compilation.warnings.push(StylelintError.format(options, warnings));
        warnings = [];
      }

      if (errors.length) {
        compilation.errors.push(StylelintError.format(options, errors));
        errors = [];
      }

      next();
    }
  );
}

function parseResults(options, results) {
  let errors = [];
  let warnings = [];

  if (options.emitError) {
    errors = results.filter(
      (file) => fileHasErrors(file) || fileHasWarnings(file)
    );
  } else if (options.emitWarning) {
    warnings = results.filter(
      (file) => fileHasErrors(file) || fileHasWarnings(file)
    );
  } else {
    warnings = results.filter(
      (file) => !fileHasErrors(file) && fileHasWarnings(file)
    );
    errors = results.filter(fileHasErrors);
  }

  if (options.quiet && warnings.length) {
    warnings = [];
  }

  return {
    errors,
    warnings,
  };
}

function fileHasErrors(file) {
  return file.errored;
}

function fileHasWarnings(file) {
  return file.warnings && file.warnings.length;
}
