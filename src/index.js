const { isAbsolute, join } = require("node:path");

const globby = require("globby");
const { isMatch } = require("micromatch");

const linter = require("./linter");
const { getOptions } = require("./options");
const { arrify, parseFiles, parseFoldersToGlobs } = require("./utils");

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Module} Module */
/** @typedef {import('./options').Options} Options */
/** @typedef {Partial<{ timestamp:number } | number>} FileSystemInfoEntry */

const STYLELINT_PLUGIN = "StylelintWebpackPlugin";
let counter = 0;

class StylelintWebpackPlugin {
  /**
   * @param {Options=} options options
   */
  constructor(options = {}) {
    this.key = STYLELINT_PLUGIN;
    this.options = getOptions(options);
    this.run = this.run.bind(this);
    this.startTime = Date.now();
    this.prevTimestamps = new Map();
  }

  /**
   * @param {Compiler} compiler compiler
   * @returns {void}
   */
  apply(compiler) {
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${this.key}_${(counter += 1)}`;

    const context = this.getContext(compiler);
    const excludeDefault = [
      "**/node_modules/**",
      String(compiler.options.output.path),
    ];

    const options = {
      ...this.options,
      context,
      exclude: parseFiles(this.options.exclude || excludeDefault, context),
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || "", context),
    };

    const wanted = parseFoldersToGlobs(options.files, options.extensions);
    const exclude = parseFoldersToGlobs(options.exclude);

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, (compiler) =>
        this.run(compiler, options, wanted, exclude),
      );
    }

    let hasCompilerRunByDirtyModule = this.options.lintDirtyModulesOnly;

    compiler.hooks.watchRun.tapPromise(this.key, (compiler) => {
      if (hasCompilerRunByDirtyModule) {
        hasCompilerRunByDirtyModule = false;

        return Promise.resolve();
      }

      return this.run(compiler, options, wanted, exclude);
    });
  }

  /**
   * @param {Compiler} compiler compiler
   * @param {Options} options options
   * @param {string[]} wanted wanted files
   * @param {string[]} exclude exclude files
   */
  async run(compiler, options, wanted, exclude) {
    // Do not re-hook
    const isCompilerHooked = compiler.hooks.thisCompilation.taps.find(
      ({ name }) => name === this.key,
    );

    if (isCompilerHooked) return;

    compiler.hooks.thisCompilation.tap(this.key, (compilation) => {
      /** @type {import('./linter').Linter} */
      let lint;

      /** @type {import('./linter').Reporter} */
      let report;

      /** @type number */
      let threads;

      try {
        ({ lint, report, threads } = linter(this.key, options, compilation));
      } catch (err) {
        compilation.errors.push(err);
        return;
      }

      compilation.hooks.finishModules.tapPromise(this.key, async () => {
        /** @type {string[]} */
        const files = compiler.modifiedFiles
          ? [...compiler.modifiedFiles].filter(
              (file) =>
                isMatch(file, wanted, { dot: true }) &&
                !isMatch(file, exclude, { dot: true }),
            )
          : globby.sync(wanted, { dot: true, ignore: exclude });

        if (threads > 1) {
          for (const file of files) {
            lint(parseFiles(file, String(options.context)));
          }
        } else if (files.length > 0) {
          lint(parseFiles(files, String(options.context)));
        }
      });

      /**
       * @returns {Promise<void>}
       */
      async function processResults() {
        const { errors, warnings, generateReportAsset } = await report();

        if (warnings && !options.failOnWarning) {
          compilation.warnings.push(warnings);
        } else if (warnings && options.failOnWarning) {
          compilation.errors.push(warnings);
        }

        if (errors && options.failOnError) {
          compilation.errors.push(errors);
        } else if (errors && !options.failOnError) {
          compilation.warnings.push(errors);
        }

        if (generateReportAsset) {
          await generateReportAsset(compilation);
        }
      }

      // await and interpret results
      compilation.hooks.additionalAssets.tapPromise(this.key, processResults);
    });
  }

  /**
   * @param {Compiler} compiler compiler
   * @returns {string} context
   */
  getContext(compiler) {
    if (!this.options.context) {
      return String(compiler.options.context);
    }

    if (!isAbsolute(this.options.context)) {
      return join(String(compiler.options.context), this.options.context);
    }

    return this.options.context;
  }
}

module.exports = StylelintWebpackPlugin;
