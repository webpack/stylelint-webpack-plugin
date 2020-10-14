import StylelintError from './StylelintError';

/** @typedef {import('stylelint').LinterResult} LinterResult */
/** @typedef {import('stylelint').LintResult} LintResult */
/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('./getOptions').Options} Options */

/**
 * @callback Lint
 * @param {Options} options
 * @returns {Promise<LinterResult>}
 */

/**
 * @callback LinterCallback
 * @param {StylelintError | null=} error
 * @returns {void}
 */

/**
 * @param {Lint} lint
 * @param {Options} options
 * @param {Compiler} compiler
 * @param {LinterCallback} callback
 * @returns {void}
 */
export default function linter(lint, options, compiler, callback) {
  /** @type {Array<LintResult>} */
  let errors = [];

  /** @type {Array<LintResult>} */
  let warnings = [];

  lint(options)
    .then(({ results }) => {
      ({ errors, warnings } = parseResults(options, results));

      compiler.hooks.afterEmit.tapAsync(
        'StylelintWebpackPlugin',
        (compilation, next) => {
          if (warnings.length) {
            // @ts-ignore
            compilation.warnings.push(StylelintError.format(options, warnings));
            warnings = [];
          }

          if (errors.length) {
            // @ts-ignore
            compilation.errors.push(StylelintError.format(options, errors));
            errors = [];
          }

          next();
        }
      );

      if (options.failOnError && errors.length) {
        callback(StylelintError.format(options, errors));
      } else if (options.failOnWarning && warnings.length) {
        callback(StylelintError.format(options, warnings));
      } else {
        callback();
      }
    })
    .catch((e) => {
      compiler.hooks.afterEmit.tapAsync(
        'StylelintWebpackPlugin',
        (compilation, next) => {
          // @ts-ignore
          compilation.errors.push(new StylelintError(e.message));
          next();
        }
      );

      callback();
    });
}

/**
 *
 * @param {Options} options
 * @param {Array<LintResult>} results
 * @returns {{errors: Array<LintResult>, warnings: Array<LintResult>}}
 */
function parseResults(options, results) {
  /** @type {Array<LintResult>} */
  let errors = [];

  /** @type {Array<LintResult>} */
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

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
function fileHasErrors(file) {
  return !!file.errored;
}

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
function fileHasWarnings(file) {
  return file.warnings && file.warnings.length > 0;
}
