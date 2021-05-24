import { cpus } from 'os';

import JestWorker from 'jest-worker';

// @ts-ignore
import { setup, lintFiles } from './worker';
import { jsonStringifyReplacerSortKeys } from './utils';
import { getStylelintOptions } from './options';

/** @type {{[key: string]: any}} */
const cache = {};

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
export function loadStylelint(options) {
  return {
    stylelint: setup(options, getStylelintOptions(options)),
    lintFiles,
    cleanup: async () => {},
    threads: 1,
  };
}

/**
 * @param {string|undefined} key
 * @param {number} poolSize
 * @param {Options} options
 * @returns {Linter}
 */
export function loadStylelintThreaded(key, poolSize, options) {
  const cacheKey = getCacheKey(key, options);
  const source = require.resolve('./worker');
  const workerOptions = {
    enableWorkerThreads: true,
    numWorkers: poolSize,
    setupArgs: [options, getStylelintOptions(options)],
  };

  const local = loadStylelint(options);

  /** @type {Worker?} */
  // prettier-ignore
  let worker = (/** @type {Worker} */ new JestWorker(source, workerOptions));

  /** @type {Linter} */
  const context = {
    ...local,
    threads: poolSize,
    lintFiles: async (files) => {
      // TODO: disable threads, not working with stylelint
      /* istanbul ignore next */
      if (worker) {
        return worker.lintFiles(files);
      }

      /* istanbul ignore next */
      return local.lintFiles(files);
    },
    cleanup: async () => {
      cache[cacheKey] = local;
      context.lintFiles = (files) => local.lintFiles(files);
      /* istanbul ignore next */
      if (worker) {
        worker.end();
        worker = null;
      }
    },
  };

  return context;
}

/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {Linter}
 */
export default function getStylelint(key, { threads, ...options }) {
  let max =
    /* istanbul ignore next */
    typeof threads !== 'number'
      ? /* istanbul ignore next */
        threads
        ? cpus().length - 1
        : 1
      : /* istanbul ignore next */
        threads;

  // TODO: disable threads, not working with stylelint
  max = 1;

  const cacheKey = getCacheKey(key, { threads, ...options });
  if (!cache[cacheKey]) {
    cache[cacheKey] =
      /* istanbul ignore next */
      max > 1
        ? loadStylelintThreaded(key, max, options)
        : loadStylelint(options);
  }
  return cache[cacheKey];
}

/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {string}
 */
function getCacheKey(key, options) {
  return JSON.stringify({ key, options }, jsonStringifyReplacerSortKeys);
}
