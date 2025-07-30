/** @typedef {import('./getStylelint').Stylelint} Stylelint */
/** @typedef {import('./getStylelint').LinterOptions} StylelintOptions */
/** @typedef {import('./getStylelint').LintResult} LintResult */
/** @typedef {import('./options').Options} Options */

/** @type {Stylelint} */
let stylelint;

/** @type {Partial<StylelintOptions>} */
let linterOptions;

/**
 * @param {Options} options the worker options
 * @param {Partial<StylelintOptions>} stylelintOptions the stylelint options
 * @returns {Stylelint} stylelint instance
 */
function setup(options, stylelintOptions) {
  stylelint = require(options.stylelintPath || "stylelint");
  linterOptions = stylelintOptions;

  return stylelint;
}

/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} results
 */
async function lintFiles(files) {
  const { results } = await stylelint.lint({
    ...linterOptions,
    files,
    quietDeprecationWarnings: true,
  });

  // Reset result to work with worker
  return results.map((result) => ({
    source: result.source,
    errored: result.errored,
    ignored: result.ignored,
    warnings: result.warnings,
    deprecations: result.deprecations,
    invalidOptionWarnings: result.invalidOptionWarnings,
    parseErrors: result.parseErrors,
  }));
}

module.exports.lintFiles = lintFiles;
module.exports.setup = setup;
