class StylelintError extends Error {
  /**
   * @param {string=} messages
   */
  constructor(messages) {
    super(`\u001b[1;31m[stylelint]\u001b[1;0m ${messages}`);
    this.name = 'StylelintError';
    this.stack = '';
  }
}

module.exports = StylelintError;
