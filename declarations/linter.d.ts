/// <reference types="stylelint" />
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
export type Stylelint = import('postcss').PluginCreator<
  import('stylelint').PostcssPluginOptions
> & {
  lint: (
    options: import('stylelint').LinterOptions
  ) => Promise<import('stylelint').LinterResult>;
  rules: {
    [k: string]: import('stylelint').Rule<any, any>;
  };
  formatters: {
    [k: string]: import('stylelint').Formatter;
  };
  createPlugin: (
    ruleName: string,
    plugin: import('stylelint').Plugin<any, any>
  ) => {
    ruleName: string;
    rule: import('stylelint').Rule<any, any>;
  };
  createLinter: (
    options: import('stylelint').LinterOptions
  ) => import('stylelint').InternalApi;
  utils: {
    report: (problem: import('stylelint').Problem) => void;
    ruleMessages: <
      T extends import('stylelint').RuleMessages,
      R extends { [K in keyof T]: T[K] }
    >(
      ruleName: string,
      messages: T
    ) => R;
    validateOptions: (
      result: import('stylelint').PostcssResult,
      ruleName: string,
      ...optionDescriptions: import('stylelint').RuleOptions[]
    ) => boolean;
    checkAgainstRule: <T_1, O extends Object>(
      options: {
        ruleName: string;
        ruleSettings: import('stylelint').ConfigRuleSettings<T_1, O>;
        root: import('postcss').Root;
      },
      callback: (warning: import('postcss').Warning) => void
    ) => void;
  };
};
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
