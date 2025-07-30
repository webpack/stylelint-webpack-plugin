const { cpus } = require("node:os");

const { Worker: JestWorker } = require("jest-worker");

const { getStylelintOptions } = require("./options");
const { jsonStringifyReplacerSortKeys } = require("./utils");
const { lintFiles, setup } = require("./worker");

/** @type {{ [key: string]: Linter }} */
const cache = {};

/** @typedef {{lint: (options: LinterOptions) => Promise<LinterResult>, formatters: { [k: string]: Formatter }}} Stylelint */
/** @typedef {import('stylelint').LintResult} LintResult */
/** @typedef {import('stylelint').LinterOptions} LinterOptions */
/** @typedef {import('stylelint').LinterResult} LinterResult */
/** @typedef {import('stylelint').Formatter} Formatter */
/** @typedef {import('stylelint').FormatterType} FormatterType */
/** @typedef {import('stylelint').RuleMeta} RuleMeta */
/** @typedef {import('./options').Options} Options */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{stylelint: Stylelint, lintFiles: LintTask, cleanup: AsyncTask, threads: number }} Linter */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */

/**
 * @param {Options} options linter options
 * @returns {Linter} linter
 */
function loadStylelint(options) {
  const stylelintOptions = getStylelintOptions(options);
  const stylelint = setup(options, stylelintOptions);

  return {
    stylelint,
    lintFiles,
    cleanup: async () => {},
    threads: 1,
  };
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {string} a stringified cache key
 */
function getCacheKey(key, options) {
  return JSON.stringify({ key, options }, jsonStringifyReplacerSortKeys);
}

/**
 * @param {string|undefined} key a cache key
 * @param {number} poolSize number of workers
 * @param {Options} options options
 * @returns {Linter} linter
 */
function loadStylelintThreaded(key, poolSize, options) {
  const cacheKey = getCacheKey(key, options);
  const source = require.resolve("./worker");
  const workerOptions = {
    enableWorkerThreads: true,
    numWorkers: poolSize,
    setupArgs: [options, getStylelintOptions(options)],
  };

  const local = loadStylelint(options);

  let worker =
    /** @type {Worker | null} */
    (new JestWorker(source, workerOptions));

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
 * @param {string|undefined} key a cache key
 * @param {Options} options options
 * @returns {Linter} linter
 */
function getStylelint(key, { threads, ...options }) {
  const max =
    typeof threads !== "number" ? (threads ? cpus().length - 1 : 1) : threads;

  const cacheKey = getCacheKey(key, { threads, ...options });
  if (!cache[cacheKey]) {
    cache[cacheKey] =
      max > 1
        ? loadStylelintThreaded(key, max, options)
        : loadStylelint(options);
  }
  return cache[cacheKey];
}

module.exports = getStylelint;
