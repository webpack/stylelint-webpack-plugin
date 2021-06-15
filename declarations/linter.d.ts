/**
 * @param {string|undefined} key
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {{lint: Linter, report: Reporter, threads: number}}
 */
export default function linter(
  key: string | undefined,
  options: Options,
  compilation: Compilation
): {
  lint: Linter;
  report: Reporter;
  threads: number;
};
export type Stylelint = typeof import('stylelint');
export type LintResult = import('stylelint').LintResult;
export type Compiler = import('webpack').Compiler;
export type Compilation = import('webpack').Compilation;
export type Options = import('./options').Options;
export type FormatterType = import('./options').FormatterType;
export type FormatterFunction = (results: LintResult[]) => string;
export type GenerateReport = (compilation: Compilation) => Promise<void>;
export type Report = {
  errors?: StylelintError;
  warnings?: StylelintError;
  generateReportAsset?: GenerateReport;
};
export type Reporter = () => Promise<Report>;
export type Linter = (files: string | string[]) => void;
export type LintResultMap = {
  [files: string]: import('stylelint').LintResult;
};
import StylelintError from './StylelintError';
