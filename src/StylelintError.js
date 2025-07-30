class StylelintError extends Error {
  /**
   * @param {string=} messages messages
   */
  constructor(messages) {
    super(`[stylelint] ${messages}`);
    this.name = "StylelintError";
    this.stack = "";
  }
}

module.exports = StylelintError;
