const { cpus } = require('os');

const { Worker: JestWorker } = require('jest-worker');

// @ts-ignore
const { setup, lintFiles } = require('./worker');
const { jsonStringifyReplacerSortKeys } = require('./utils');
const { getStylelintOptions } = require('./options');

/** @type {{[key: string]: any}} */
const cache = {};

/** @typedef {{lint: (options: LinterOptions) => Promise<LinterResult>, formatters: { [k: string]: Formatter }}} Stylelint */
/** @typedef {import('stylelint').LintResult} LintResult */
/** @typedef {import('stylelint').LinterOptions} LinterOptions */
/** @typedef {import('stylelint').LinterResult} LinterResult */
/** @typedef {import('stylelint').Formatter} Formatter */
/** @typedef {import('stylelint').FormatterType} FormatterType */
/** @typedef {import('./options').Options} Options */
/** @typedef {(stylelint: Stylelint, filePath: string) => Promise<boolean>} isPathIgnored */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{stylelint: Stylelint, isPathIgnored: isPathIgnored, lintFiles: LintTask, cleanup: AsyncTask, threads: number }} Linter */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */

/**
 * @param {Options} options
 * @returns {Linter}
 */
function loadStylelint(options) {
  const stylelintOptions = getStylelintOptions(options);
  const stylelint = setup(options, stylelintOptions);

  /** @type {isPathIgnored} */
  let isPathIgnored;

  try {
    isPathIgnored = require(`${options.stylelintPath}/lib/isPathIgnored`);
  } catch (e) {
    try {
      // @ts-ignore
      isPathIgnored = require('stylelint/lib/isPathIgnored');
    } catch (_) {
      isPathIgnored = () => Promise.resolve(false);
    }
  }

  return {
    stylelint,
    isPathIgnored,
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
function loadStylelintThreaded(key, poolSize, options) {
  const cacheKey = getCacheKey(key, options);
  const source = require.resolve('./worker');
  const workerOptions = {
    enableWorkerThreads: true,
    numWorkers: poolSize,
    setupArgs: [options, getStylelintOptions(options)],
  };

  const local = loadStylelint(options);

  let worker = /** @type {Worker?} */ (new JestWorker(source, workerOptions));

  /** @type {Linter} */
  const context = {
    ...local,
    threads: poolSize,
    lintFiles: async (files) =>
      /* istanbul ignore next */
      worker ? worker.lintFiles(files) : local.lintFiles(files),
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
function getStylelint(key, { threads, ...options }) {
  const max =
    typeof threads !== 'number' ? (threads ? cpus().length - 1 : 1) : threads;

  const cacheKey = getCacheKey(key, { threads, ...options });
  if (!cache[cacheKey]) {
    cache[cacheKey] =
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

module.exports = getStylelint;
