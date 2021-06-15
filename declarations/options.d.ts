/** @typedef {import("stylelint")} stylelint */
/** @typedef {import("stylelint").LinterOptions} StylelintOptions */
/** @typedef {import("stylelint").FormatterType} FormatterType */
/**
 * @typedef {Object} OutputReport
 * @property {string=} filePath
 * @property {FormatterType=} formatter
 */
/**
 * @typedef {Object} PluginOptions
 * @property {string} context
 * @property {boolean} emitError
 * @property {boolean} emitWarning
 * @property {string|string[]=} exclude
 * @property {string|string[]} extensions
 * @property {boolean} failOnError
 * @property {boolean} failOnWarning
 * @property {string|string[]} files
 * @property {FormatterType} formatter
 * @property {boolean} lintDirtyModulesOnly
 * @property {boolean} quiet
 * @property {string} stylelintPath
 * @property {OutputReport} outputReport
 * @property {number|boolean=} threads
 */
/** @typedef {Partial<PluginOptions & StylelintOptions>} Options */
/**
 * @param {Options} pluginOptions
 * @returns {Partial<PluginOptions>}
 */
export function getOptions(pluginOptions: Options): Partial<PluginOptions>;
/**
 * @param {Options} pluginOptions
 * @returns {Partial<StylelintOptions>}
 */
export function getStylelintOptions(
  pluginOptions: Options
): Partial<StylelintOptions>;
export type stylelint = typeof import('stylelint');
export type StylelintOptions = import('stylelint').LinterOptions;
export type FormatterType = import('stylelint').FormatterType;
export type OutputReport = {
  filePath?: string | undefined;
  formatter?: FormatterType | undefined;
};
export type PluginOptions = {
  context: string;
  emitError: boolean;
  emitWarning: boolean;
  exclude?: (string | string[]) | undefined;
  extensions: string | string[];
  failOnError: boolean;
  failOnWarning: boolean;
  files: string | string[];
  formatter: FormatterType;
  lintDirtyModulesOnly: boolean;
  quiet: boolean;
  stylelintPath: string;
  outputReport: OutputReport;
  threads?: (number | boolean) | undefined;
};
export type Options = Partial<PluginOptions & StylelintOptions>;
