/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {Linter}
 */
export default function getStylelint(
  key: string | undefined,
  { threads, ...options }: Options
): Linter;
export type Stylelint = typeof import('stylelint');
export type LintResult = import('stylelint').LintResult;
export type Options = import('./options').Options;
export type AsyncTask = () => Promise<void>;
export type LintTask = (files: string | string[]) => Promise<LintResult[]>;
export type Worker = JestWorker & {
  lintFiles: LintTask;
};
export type Linter = {
  stylelint: Stylelint;
  lintFiles: LintTask;
  cleanup: AsyncTask;
  threads: number;
};
import { Worker as JestWorker } from 'jest-worker';
