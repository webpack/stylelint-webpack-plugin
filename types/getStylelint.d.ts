export = getStylelint;
/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {Linter}
 */
declare function getStylelint(
  key: string | undefined,
  { threads, ...options }: Options
): Linter;
declare namespace getStylelint {
  export {
    Stylelint,
    LintResult,
    LinterOptions,
    LinterResult,
    Formatter,
    FormatterType,
    Options,
    isPathIgnored,
    AsyncTask,
    LintTask,
    Linter,
    Worker,
  };
}
type Options = import('./options').Options;
type Linter = {
  stylelint: Stylelint;
  isPathIgnored: isPathIgnored;
  lintFiles: LintTask;
  cleanup: AsyncTask;
  threads: number;
};
type Stylelint = {
  lint: (options: LinterOptions) => Promise<LinterResult>;
  formatters: {
    [k: string]: import('stylelint').Formatter;
  };
};
type LintResult = import('stylelint').LintResult;
type LinterOptions = import('stylelint').LinterOptions;
type LinterResult = import('stylelint').LinterResult;
type Formatter = import('stylelint').Formatter;
type FormatterType = import('stylelint').FormatterType;
type isPathIgnored = (
  stylelint: Stylelint,
  filePath: string
) => Promise<boolean>;
type AsyncTask = () => Promise<void>;
type LintTask = (files: string | string[]) => Promise<LintResult[]>;
type Worker = JestWorker & {
  lintFiles: LintTask;
};
import { Worker as JestWorker } from 'jest-worker';
