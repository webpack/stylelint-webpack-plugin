export = StylelintWebpackPlugin;
declare class StylelintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options?: Options);
  key: string;
  options: Partial<import('./options').PluginOptions>;
  /**
   * @param {Compiler} compiler
   * @param {Options} options
   * @param {string[]} wanted
   * @param {string[]} exclude
   */
  run(
    compiler: Compiler,
    options: Options,
    wanted: string[],
    exclude: string[]
  ): Promise<void>;
  startTime: number;
  prevTimestamps: Map<any, any>;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler: Compiler): string;
}
declare namespace StylelintWebpackPlugin {
  export { Compiler, Module, Options, FileSystemInfoEntry };
}
type Compiler = import('webpack').Compiler;
type Options = import('./options').Options;
type Module = import('webpack').Module;
type FileSystemInfoEntry = Partial<
  | {
      timestamp: number;
    }
  | number
>;
