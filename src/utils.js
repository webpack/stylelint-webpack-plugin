/** @typedef {import('stylelint').LintResult} LintResult */

/**
 * @param {string} str
 * @returns {string}
 */
export function replaceBackslashes(str) {
  return str.replace(/\\/g, '/');
}

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
export function fileHasErrors(file) {
  return !!file.errored;
}

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
export function fileHasWarnings(file) {
  return file.warnings && file.warnings.length > 0;
}
