export type Stylelint = import("./getStylelint").Stylelint;
export type StylelintOptions = import("./getStylelint").LinterOptions;
export type LintResult = import("./getStylelint").LintResult;
export type Options = import("./options").Options;
/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} results
 */
export function lintFiles(files: string | string[]): Promise<LintResult[]>;
/**
 * @param {Options} options the worker options
 * @param {Partial<StylelintOptions>} stylelintOptions the stylelint options
 * @returns {Stylelint} stylelint instance
 */
export function setup(
  options: Options,
  stylelintOptions: Partial<StylelintOptions>,
): Stylelint;
