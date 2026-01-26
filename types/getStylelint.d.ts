export = getStylelint;
/**
 * @param {string|undefined} key a cache key
 * @param {Options} options options
 * @returns {Linter} linter
 */
declare function getStylelint(
  key: string | undefined,
  { threads, ...options }: Options,
): Linter;
declare namespace getStylelint {
  export {
    Stylelint,
    LintResult,
    LinterOptions,
    LinterResult,
    Formatter,
    FormatterType,
    RuleMeta,
    Options,
    AsyncTask,
    LintTask,
    Linter,
    Worker,
  };
}
type Stylelint = {
  lint: (options: LinterOptions) => Promise<LinterResult>;
  formatters: {
    [k: string]: Formatter;
  };
};
type LintResult = import("stylelint").LintResult;
type LinterOptions = import("stylelint").LinterOptions;
type LinterResult = import("stylelint").LinterResult;
type Formatter = import("stylelint").Formatter;
type FormatterType = import("stylelint").FormatterType;
type RuleMeta = import("stylelint").RuleMeta;
type Options = import("./options").Options;
type AsyncTask = () => Promise<void>;
type LintTask = (files: string | string[]) => Promise<LintResult[]>;
type Linter = {
  getStylelint: () => Promise<Stylelint>;
  lintFiles: LintTask;
  cleanup: AsyncTask;
  threads: number;
};
type Worker = JestWorker & {
  lintFiles: LintTask;
};
import { Worker as JestWorker } from "jest-worker";
