/// <reference types="stylelint" />
export = linter;
/**
 * @param {string|undefined} key
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {{stylelint: Stylelint, isPathIgnored: isPathIgnored, lint: Linter, report: Reporter, threads: number}}
 */
declare function linter(
  key: string | undefined,
  options: Options,
  compilation: Compilation
): {
  stylelint: Stylelint;
  isPathIgnored: getStylelint.isPathIgnored;
  lint: Linter;
  report: Reporter;
  threads: number;
};
declare namespace linter {
  export {
    Compiler,
    Compilation,
    Stylelint,
    LintResult,
    LinterResult,
    Formatter,
    FormatterType,
    isPathIgnored,
    Options,
    GenerateReport,
    Report,
    Reporter,
    Linter,
    LintResultMap,
  };
}
type Options = import('./options').Options;
type Compilation = import('webpack').Compilation;
type Stylelint = import('./getStylelint').Stylelint;
type Linter = (files: string | string[]) => void;
type Reporter = () => Promise<Report>;
import getStylelint = require('./getStylelint');
type Compiler = import('webpack').Compiler;
type LintResult = import('./getStylelint').LintResult;
type LinterResult = import('./getStylelint').LinterResult;
type Formatter = import('./getStylelint').Formatter;
type FormatterType = import('./getStylelint').FormatterType;
type isPathIgnored = import('./getStylelint').isPathIgnored;
type GenerateReport = (compilation: Compilation) => Promise<void>;
type Report = {
  errors?: StylelintError;
  warnings?: StylelintError;
  generateReportAsset?: GenerateReport;
};
type LintResultMap = {
  [files: string]: import('stylelint').LintResult;
};
import StylelintError = require('./StylelintError');
