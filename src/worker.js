/** @typedef {import('./getStylelint').Stylelint} Stylelint */
/** @typedef {import('./getStylelint').LinterOptions} StylelintOptions */
/** @typedef {import('./getStylelint').LintResult} LintResult */
/** @typedef {import('./options').Options} Options */

/** @type {string} */
let stylelintPath = "stylelint";

/** @type {Partial<StylelintOptions>} */
let linterOptions;

/** @type {Promise<Stylelint> | null} */
let stylelintPromise = null;

/**
 * Lazily load stylelint on first use
 * @returns {Promise<Stylelint>} stylelint instance
 */
async function getStylelint() {
  if (!stylelintPromise) {
    stylelintPromise = (async () => {
      const mod = await import(stylelintPath);
      // Handle both CJS (v13-v16) and ESM (v17) exports
      return mod.default || mod;
    })();
  }
  return stylelintPromise;
}

/**
 * @param {Options} options the worker options
 * @param {Partial<StylelintOptions>} stylelintOptions the stylelint options
 */
function setup(options, stylelintOptions) {
  stylelintPath = options.stylelintPath || "stylelint";
  linterOptions = stylelintOptions;
  // Reset cached stylelint in case path changed
  stylelintPromise = null;
}

/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} results
 */
async function lintFiles(files) {
  const stylelint = await getStylelint();
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

module.exports.getStylelint = getStylelint;
module.exports.lintFiles = lintFiles;
module.exports.setup = setup;
