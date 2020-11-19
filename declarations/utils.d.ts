/** @typedef {import('stylelint').LintResult} LintResult */
/**
 * @param {string} str
 * @returns {string}
 */
export function replaceBackslashes(str: string): string;
/**
 * @param {LintResult} file
 * @returns {boolean}
 */
export function fileHasErrors(file: LintResult): boolean;
/**
 * @param {LintResult} file
 * @returns {boolean}
 */
export function fileHasWarnings(file: LintResult): boolean;
export type LintResult = import('stylelint').LintResult;
