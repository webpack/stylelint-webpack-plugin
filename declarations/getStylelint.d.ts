/** @typedef {import('stylelint')} Stylelint */
/** @typedef {import('stylelint').LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */
/** @typedef {{stylelint: Stylelint, lintFiles: LintTask, cleanup: AsyncTask, threads: number, }} Linter */
/**
 * @param {Options} options
 * @returns {Linter}
 */
export function loadStylelint(options: Options): Linter;
/**
 * @param {string|undefined} key
 * @param {number} poolSize
 * @param {Options} options
 * @returns {Linter}
 */
export function loadStylelintThreaded(
  key: string | undefined,
  poolSize: number,
  options: Options
): Linter;
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
import JestWorker from 'jest-worker';
