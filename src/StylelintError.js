class StylelintError extends Error {
  /**
   * @param {string=} messages
   */
  constructor(messages) {
    super(`[stylelint] ${messages}`);
    this.name = 'StylelintError';
    this.stack = '';
  }
}

export default StylelintError;
