/** @typedef {import('stylelint')} Stylelint */
/** @typedef {import("stylelint").LinterOptions} StylelintOptions */
/** @typedef {import('./options').Options} Options */

Object.assign(module.exports, {
  lintFiles,
  setup,
});

/** @type {Stylelint} */
let stylelint;

/** @type {Partial<StylelintOptions>} */
let linterOptions;

/**
 * @param {Options} options
 * @param {Partial<StylelintOptions>} stylelintOptions
 */
function setup(options, stylelintOptions) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  stylelint = require(options.stylelintPath || 'stylelint');
  linterOptions = stylelintOptions;

  return stylelint;
}

/**
 * @param {string | string[]} files
 */
async function lintFiles(files) {
  const { results } = await stylelint.lint({
    ...linterOptions,
    files,
  });

  return results;
}
