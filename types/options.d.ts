export type StylelintOptions = import("./getStylelint").LinterOptions;
export type FormatterType = import("./getStylelint").FormatterType;
export type OutputReport = {
  /**
   * file path
   */
  filePath?: string | undefined;
  /**
   * formatter
   */
  formatter?: FormatterType | undefined;
};
export type PluginOptions = {
  /**
   * a string indicating the root of your files
   */
  context: string;
  /**
   * the errors found will always be emitted
   */
  emitError: boolean;
  /**
   * the warnings found will always be emitted
   */
  emitWarning: boolean;
  /**
   * specify the files and/or directories to exclude
   */
  exclude?: (string | string[]) | undefined;
  /**
   * specify the extensions that should be checked
   */
  extensions: string | string[];
  /**
   * will cause the module build to fail if there are any errors
   */
  failOnError: boolean;
  /**
   * will cause the module build to fail if there are any warning
   */
  failOnWarning: boolean;
  /**
   * specify directories, files, or globs
   */
  files: string | string[];
  /**
   * specify the formatter you would like to use to format your results
   */
  formatter: FormatterType;
  /**
   * lint only changed files, skip linting on start
   */
  lintDirtyModulesOnly: boolean;
  /**
   * will process and report errors only and ignore warnings
   */
  quiet: boolean;
  /**
   * path to `stylelint` instance that will be used for linting
   */
  stylelintPath: string;
  /**
   * writes the output of the errors to a file - for example, a `json` file for use for reporting
   */
  outputReport: OutputReport;
  /**
   * number of worker threads
   */
  threads?: (number | boolean) | undefined;
};
export type Options = Partial<PluginOptions & StylelintOptions>;
/** @typedef {import('./getStylelint').LinterOptions} StylelintOptions */
/** @typedef {import('./getStylelint').FormatterType} FormatterType */
/**
 * @typedef {object} OutputReport
 * @property {string=} filePath file path
 * @property {FormatterType=} formatter formatter
 */
/**
 * @typedef {object} PluginOptions
 * @property {string} context a string indicating the root of your files
 * @property {boolean} emitError the errors found will always be emitted
 * @property {boolean} emitWarning the warnings found will always be emitted
 * @property {string | string[]=} exclude specify the files and/or directories to exclude
 * @property {string | string[]} extensions specify the extensions that should be checked
 * @property {boolean} failOnError will cause the module build to fail if there are any errors
 * @property {boolean} failOnWarning will cause the module build to fail if there are any warning
 * @property {string | string[]} files specify directories, files, or globs
 * @property {FormatterType} formatter specify the formatter you would like to use to format your results
 * @property {boolean} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {boolean} quiet will process and report errors only and ignore warnings
 * @property {string} stylelintPath path to `stylelint` instance that will be used for linting
 * @property {OutputReport} outputReport writes the output of the errors to a file - for example, a `json` file for use for reporting
 * @property {number | boolean=} threads number of worker threads
 */
/** @typedef {Partial<PluginOptions & StylelintOptions>} Options */
/**
 * @param {Options} pluginOptions plugin options
 * @returns {Partial<PluginOptions>} partial plugin options
 */
export function getOptions(pluginOptions: Options): Partial<PluginOptions>;
/**
 * @param {Options} pluginOptions plugin options
 * @returns {Partial<StylelintOptions>} stylelint options
 */
export function getStylelintOptions(
  pluginOptions: Options,
): Partial<StylelintOptions>;
