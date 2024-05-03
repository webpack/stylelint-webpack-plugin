export = linter;
/**
 * @param {string|undefined} key
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {{lint: Linter, report: Reporter, threads: number}}
 */
declare function linter(
  key: string | undefined,
  options: Options,
  compilation: Compilation,
): {
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
type Linter = (files: string | string[]) => void;
type Reporter = () => Promise<Report>;
type Compiler = import('webpack').Compiler;
type Stylelint = import('./getStylelint').Stylelint;
type LintResult = import('./getStylelint').LintResult;
type LinterResult = import('./getStylelint').LinterResult;
type Formatter = import('./getStylelint').Formatter;
type FormatterType = import('./getStylelint').FormatterType;
type GenerateReport = (compilation: Compilation) => Promise<void>;
type Report = {
  errors?: StylelintError;
  warnings?: StylelintError;
  generateReportAsset?: GenerateReport;
};
type LintResultMap = {
  [files: string]: LintResult;
};
import StylelintError = require('./StylelintError');
