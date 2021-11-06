export default StylelintWebpackPlugin;
export type Compiler = import('webpack').Compiler;
export type Module = import('webpack').Module;
export type Options = import('./options').Options;
export type FileSystemInfoEntry = Partial<
  | {
      timestamp: number;
    }
  | number
>;
declare class StylelintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options?: Options);
  key: string;
  options: Partial<import('./options').PluginOptions>;
  /**
   * @param {Compiler} compiler
   */
  run(compiler: Compiler): Promise<void>;
  startTime: number;
  /** @type {ReadonlyMap<string, null | FileSystemInfoEntry | "ignore" | undefined>} */
  prevTimestamps: ReadonlyMap<
    string,
    'ignore' | FileSystemInfoEntry | null | undefined
  >;
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
  /**
   * @param {Compiler} compiler
   * @param {string[]} wanted
   * @param {string[]} exclude
   * @returns {string[]}
   */
  getFiles(compiler: Compiler, wanted: string[], exclude: string[]): string[];
  /**
   * @param {ReadonlyMap<string, null | FileSystemInfoEntry | "ignore" | undefined>} fileTimestamps
   * @returns {string[]}
   */
  getChangedFiles(
    fileTimestamps: ReadonlyMap<
      string,
      'ignore' | FileSystemInfoEntry | null | undefined
    >
  ): string[];
}
