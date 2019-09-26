export default class StylelintError extends Error {
  constructor(messages) {
    super(messages);
    this.name = 'StylelintError';
    this.stack = false;
  }

  static format({ formatter }, messages) {
    return new StylelintError(formatter(messages));
  }
}
