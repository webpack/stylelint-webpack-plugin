export default StylelintWebpackPlugin;
export type NormalModule = import('webpack').NormalModule;
export type Compiler = import('webpack').Compiler;
export type LintResult = import('stylelint').LintResult;
/** @typedef {import('webpack').NormalModule} NormalModule */
/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('stylelint').LintResult} LintResult */
declare class StylelintWebpackPlugin {
  /**
   *
   * @param {LintResult} file
   * @returns {boolean}
   */
  static fileHasWarnings(file: LintResult): boolean;
  /**
   *
   * @param {LintResult} file
   * @returns {boolean}
   */
  static fileHasErrors(file: LintResult): boolean;
  constructor(options?: {});
  options: import('./getOptions').Options;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  run(compiler: Compiler): void;
  /**
   *
   * @param {Array<LintResult>} results
   * @returns {{errors: Array<LintResult>, warnings: Array<LintResult>}}
   */
  parseResults(
    results: Array<LintResult>
  ): {
    errors: Array<LintResult>;
    warnings: Array<LintResult>;
  };
  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler: Compiler): string;
}
