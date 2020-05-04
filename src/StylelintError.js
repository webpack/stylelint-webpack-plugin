/** @typedef {import('stylelint').LintResult} LintResult */
/** @typedef {import('./getOptions').Options} Options */

export default class StylelintError extends Error {
  /**
   * @param {Partial<string>} messages
   */
  constructor(messages) {
    super(messages);
    this.name = 'StylelintError';
    this.stack = '';
  }

  /**
   * @param {Options} options
   * @param {Array<LintResult>} messages
   * @returns {StylelintError}
   */
  static format({ formatter }, messages) {
    // @ts-ignore
    return new StylelintError(formatter(messages));
  }
}
