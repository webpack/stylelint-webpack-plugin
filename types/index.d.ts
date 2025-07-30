export = StylelintWebpackPlugin;
declare class StylelintWebpackPlugin {
  /**
   * @param {Options=} options options
   */
  constructor(options?: Options | undefined);
  key: string;
  options: Partial<import("./options").PluginOptions>;
  /**
   * @param {Compiler} compiler compiler
   * @param {Options} options options
   * @param {string[]} wanted wanted files
   * @param {string[]} exclude exclude files
   */
  run(
    compiler: Compiler,
    options: Options,
    wanted: string[],
    exclude: string[],
  ): Promise<void>;
  startTime: number;
  prevTimestamps: Map<any, any>;
  /**
   * @param {Compiler} compiler compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Compiler} compiler compiler
   * @returns {string} context
   */
  getContext(compiler: Compiler): string;
}
declare namespace StylelintWebpackPlugin {
  export { Compiler, Module, Options, FileSystemInfoEntry, EXPECTED_ANY };
}
type Compiler = import("webpack").Compiler;
type Module = import("webpack").Module;
type Options = import("./options").Options;
type FileSystemInfoEntry = Partial<
  | {
      timestamp: number;
    }
  | number
>;
type EXPECTED_ANY = any;
