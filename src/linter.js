const { dirname, isAbsolute, join } = require("node:path");

const StylelintError = require("./StylelintError");
const getStylelintModule = require("./getStylelint");
const { arrify } = require("./utils");

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('./getStylelint').Stylelint} Stylelint */
/** @typedef {import('./getStylelint').LintResult} LintResult */
/** @typedef {import('./getStylelint').LinterResult} LinterResult */
/** @typedef {import('./getStylelint').Formatter} Formatter */
/** @typedef {import('./getStylelint').FormatterType} FormatterType */
/** @typedef {import('./getStylelint').RuleMeta} RuleMeta */
/** @typedef {import('./options').Options} Options */
/** @typedef {(compilation: Compilation) => Promise<void>} GenerateReport */
/** @typedef {{errors?: StylelintError, warnings?: StylelintError, generateReportAsset?: GenerateReport}} Report */
/** @typedef {() => Promise<Report>} Reporter */
/** @typedef {(files: string|string[]) => void} Linter */
/** @typedef {{[files: string]: LintResult}} LintResultMap */

/** @type {WeakMap<Compiler, LintResultMap>} */
const resultStorage = new WeakMap();

/**
 * @param {Compilation} compilation compilation
 * @returns {LintResultMap} lint result map
 */
function getResultStorage({ compiler }) {
  let storage = resultStorage.get(compiler);
  if (!storage) {
    resultStorage.set(compiler, (storage = {}));
  }
  return storage;
}

/**
 * @param {LintResult[]} results results
 * @returns {LintResult[]} filtered results without ignored
 */
function removeIgnoredWarnings(results) {
  return results.filter((result) => !result.ignored);
}

/**
 * @param {Promise<LintResult[]>[]} results results
 * @returns {Promise<LintResult[]>} flatten results
 */
async function flatten(results) {
  /**
   * @param {LintResult[]} acc acc
   * @param {LintResult[]} list list
   * @returns {LintResult[]} result
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * @param {() => Promise<Stylelint>} getStylelint stylelint getter
 * @param {FormatterType=} formatter formatter
 * @returns {Promise<Formatter>} resolved formatter
 */
async function loadFormatter(getStylelint, formatter) {
  if (typeof formatter === "function") {
    return formatter;
  }

  const stylelint = await getStylelint();

  if (typeof formatter === "string") {
    try {
      const fmt = stylelint.formatters[formatter];
      // Handle both sync (v13-v15) and promise-based (v16+) formatters
      return fmt instanceof Promise ? await fmt : fmt;
    } catch {
      // Load the default formatter.
    }
  }

  const defaultFmt = stylelint.formatters.string;
  // Handle both sync (v13-v15) and promise-based (v16+) formatters
  return defaultFmt instanceof Promise ? await defaultFmt : defaultFmt;
}

/* istanbul ignore next */
/**
 * @param {LintResult[]} lintResults lint results
 * @returns {{ [ruleName: string]: Partial<RuleMeta> }} a rule meta
 */
function getRuleMetadata(lintResults) {
  const [lintResult] = lintResults;

  if (lintResult === undefined) return {};

  if (lintResult._postcssResult === undefined) return {};

  return lintResult._postcssResult.stylelint.ruleMetadata;
}

/**
 * @param {Formatter} formatter formatter
 * @param {{ errors: LintResult[]; warnings: LintResult[]; }} results results
 * @param {LinterResult} returnValue return value
 * @returns {{ errors?: StylelintError, warnings?: StylelintError }} formatted result
 */
function formatResults(formatter, results, returnValue) {
  let errors;
  let warnings;
  if (results.warnings.length > 0) {
    warnings = new StylelintError(formatter(results.warnings, returnValue));
  }

  if (results.errors.length > 0) {
    errors = new StylelintError(formatter(results.errors, returnValue));
  }

  return {
    errors,
    warnings,
  };
}

/**
 * @param {Options} options options
 * @param {LintResult[]} results results
 * @returns {{ errors: LintResult[], warnings: LintResult[] }} parsed results
 */
function parseResults(options, results) {
  /** @type {LintResult[]} */
  const errors = [];

  /** @type {LintResult[]} */
  const warnings = [];

  for (const file of results) {
    const fileErrors = file.warnings.filter(
      (message) => options.emitError && message.severity === "error",
    );

    if (fileErrors.length > 0) {
      errors.push({
        ...file,
        warnings: fileErrors,
      });
    }

    const fileWarnings = file.warnings.filter(
      (message) => options.emitWarning && message.severity === "warning",
    );

    if (fileWarnings.length > 0) {
      warnings.push({
        ...file,
        warnings: fileWarnings,
      });
    }
  }

  return {
    errors,
    warnings,
  };
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @param {Compilation} compilation compilation
 * @returns {{ lint: Linter, report: Reporter, threads: number }} the linter with additional functions
 */
function linter(key, options, compilation) {
  /** @type {() => Promise<Stylelint>} */
  let getStylelint;

  /** @type {(files: string | string[]) => Promise<LintResult[]>} */
  let lintFiles;

  /** @type {() => Promise<void>} */
  let cleanup;

  /** @type number */
  let threads;

  /** @type {Promise<LintResult[]>[]} */
  const rawResults = [];

  const crossRunResultStorage = getResultStorage(compilation);

  try {
    ({ getStylelint, lintFiles, cleanup, threads } = getStylelintModule(
      key,
      options,
    ));
  } catch (err) {
    throw new StylelintError(err.message);
  }

  /**
   * @param {string | string[]} files files
   */
  function lint(files) {
    for (const file of arrify(files)) {
      delete crossRunResultStorage[file];
    }
    rawResults.push(
      lintFiles(files).catch((err) => {
        compilation.errors.push(new StylelintError(err.message));
        return [];
      }),
    );
  }

  /**
   * @returns {Promise<Report>} report
   */
  async function report() {
    // Filter out ignored files.
    let results = removeIgnoredWarnings(
      // Get the current results, resetting the rawResults to empty
      await flatten(rawResults.splice(0)),
    );

    await cleanup();

    for (const result of results) {
      crossRunResultStorage[String(result.source)] = result;
    }

    results = Object.values(crossRunResultStorage);

    // do not analyze if there are no results or stylelint config
    if (!results || results.length < 1) {
      return {};
    }

    const formatter = await loadFormatter(getStylelint, options.formatter);

    /** @type {LinterResult} */
    const returnValue = {
      cwd: /** @type {string} */ (options.cwd),
      errored: false,
      results: [],
      report: "",
      reportedDisables: [],
      ruleMetadata: getRuleMetadata(results),
    };

    const { errors, warnings } = formatResults(
      formatter,
      parseResults(options, results),
      returnValue,
    );

    /**
     * @param {Compilation} compilation compilation
     * @returns {Promise<void>}
     */
    async function generateReportAsset({ compiler }) {
      const { outputReport } = options;
      /**
       * @param {string} name name
       * @param {string | Buffer} content content
       * @returns {Promise<void>}
       */
      const save = (name, content) =>
        /** @type {Promise<void>} */
        (
          new Promise((finish, bail) => {
            if (!compiler.outputFileSystem) return;
            const { mkdir, writeFile } = compiler.outputFileSystem;
            // ensure directory exists
            mkdir(dirname(name), { recursive: true }, (err) => {
              /* istanbul ignore if */
              if (err) {
                bail(err);
              } else {
                writeFile(name, content, (err2) => {
                  /* istanbul ignore if */
                  if (err2) bail(err2);
                  else finish();
                });
              }
            });
          })
        );

      if (!outputReport || !outputReport.filePath) {
        return;
      }

      const content = outputReport.formatter
        ? (await loadFormatter(getStylelint, outputReport.formatter))(
            results,
            returnValue,
          )
        : formatter(results, returnValue);

      let { filePath } = outputReport;
      if (!isAbsolute(filePath)) {
        filePath = join(compiler.outputPath, filePath);
      }

      await save(filePath, String(content));
    }

    return {
      errors,
      warnings,
      generateReportAsset,
    };
  }

  return {
    lint,
    report,
    threads,
  };
}

module.exports = linter;
