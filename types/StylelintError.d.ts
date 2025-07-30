export = StylelintError;
declare class StylelintError extends Error {
  /**
   * @param {string=} messages messages
   */
  constructor(messages?: string | undefined);
  stack: string;
}
