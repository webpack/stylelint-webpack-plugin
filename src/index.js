import { isAbsolute, join } from 'path';

// @ts-ignore
import arrify from 'arrify';
import { isMatch } from 'micromatch';

import { getOptions } from './options';
import linter from './linter';
import { parseFiles, parseFoldersToGlobs } from './utils';

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Module} Module */
/** @typedef {import('./options').Options} Options */
/** @typedef {Partial<{timestamp:number} | number>} FileSystemInfoEntry */

const STYLELINT_PLUGIN = 'StylelintWebpackPlugin';
let counter = 0;

class StylelintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options = {}) {
    this.key = STYLELINT_PLUGIN;
    this.options = getOptions(options);
    this.run = this.run.bind(this);
    this.startTime = Date.now();
    this.prevTimestamps = new Map();
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${this.key}_${(counter += 1)}`;

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, this.run);
    }

    let isFirstRun = this.options.lintDirtyModulesOnly;
    compiler.hooks.watchRun.tapPromise(this.key, (c) => {
      if (isFirstRun) {
        isFirstRun = false;

        return Promise.resolve();
      }

      return this.run(c);
    });
  }

  /**
   * @param {Compiler} compiler
   */
  async run(compiler) {
    // Do not re-hook
    if (
      // @ts-ignore
      compiler.hooks.thisCompilation.taps.find(({ name }) => name === this.key)
    ) {
      return;
    }

    const context = this.getContext(compiler);
    const options = {
      ...this.options,
      exclude: parseFiles(this.options.exclude || [], context),
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || '', context),
    };

    const wanted = parseFoldersToGlobs(options.files, options.extensions);
    const exclude = parseFoldersToGlobs(
      this.options.exclude ? options.exclude : '**/node_modules/**',
      []
    );

    compiler.hooks.thisCompilation.tap(this.key, (compilation) => {
      /** @type {import('./linter').Linter} */
      let lint;
      /** @type {import('./linter').Reporter} */
      let report;
      /** @type number */
      let threads;

      try {
        ({ lint, report, threads } = linter(this.key, options, compilation));
      } catch (e) {
        compilation.errors.push(e);
        return;
      }

      /** @type {string[]} */
      const files = [];

      // Add the file to be linted
      compilation.hooks.succeedModule.tap(this.key, (module) => {
        const filteredFiles = this.getFiles(compiler, module).filter(
          (file) =>
            !files.includes(file) &&
            isMatch(file, wanted, { dot: true }) &&
            !isMatch(file, exclude, { dot: true })
        );

        for (const file of filteredFiles) {
          files.push(file);

          if (threads > 1) {
            lint(parseFiles(file, context));
          }
        }
      });

      // Lint all files added
      compilation.hooks.finishModules.tap(this.key, () => {
        if (files.length > 0 && threads <= 1) {
          lint(parseFiles(files, context));
        }
      });

      // await and interpret results
      compilation.hooks.additionalAssets.tapPromise(this.key, processResults);

      async function processResults() {
        const { errors, warnings, generateReportAsset } = await report();

        if (warnings && !options.failOnWarning) {
          // @ts-ignore
          compilation.warnings.push(warnings);
        } else if (warnings && options.failOnWarning) {
          // @ts-ignore
          compilation.errors.push(warnings);
        }

        if (errors && options.failOnError) {
          // @ts-ignore
          compilation.errors.push(errors);
        } else if (errors && !options.failOnError) {
          // @ts-ignore
          compilation.warnings.push(errors);
        }

        if (generateReportAsset) {
          await generateReportAsset(compilation);
        }
      }
    });
  }

  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
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

  /**
   * @param {Compiler} compiler
   * @param {Module} module
   * @returns {string[]}
   */
  getFiles(compiler, module) {
    /** @type {string[]} */
    let files = [];

    // webpack 5
    if (
      module.buildInfo &&
      module.buildInfo.snapshot &&
      module.buildInfo.snapshot.fileTimestamps
    ) {
      files = this.getChangedFiles(module.buildInfo.snapshot.fileTimestamps);
    }

    // webpack 4
    /* istanbul ignore next */
    else if (module.buildInfo && module.buildInfo.fileDependencies) {
      files = Array.from(module.buildInfo.fileDependencies);

      if (compiler.fileTimestamps && compiler.fileTimestamps.size > 0) {
        const fileDependencies = new Map();

        for (const [filename, timestamp] of compiler.fileTimestamps.entries()) {
          if (files.includes(filename)) {
            fileDependencies.set(filename, timestamp);
          }
        }

        files = this.getChangedFiles(fileDependencies);
      }
    }

    return files;
  }

  /**
   * @param {Map<string, null | FileSystemInfoEntry | "ignore">} fileTimestamps
   * @returns {string[]}
   */
  getChangedFiles(fileTimestamps) {
    /**
     * @param {null | FileSystemInfoEntry | "ignore"} fileSystemInfoEntry
     * @returns {Partial<number>}
     */
    const getTimestamps = (fileSystemInfoEntry) => {
      // @ts-ignore
      if (fileSystemInfoEntry && fileSystemInfoEntry.timestamp) {
        // @ts-ignore
        return fileSystemInfoEntry.timestamp;
      }

      // @ts-ignore
      return fileSystemInfoEntry;
    };

    /**
     * @param {string} filename
     * @param {null | FileSystemInfoEntry | "ignore"} fileSystemInfoEntry
     * @returns {boolean}
     */
    const hasFileChanged = (filename, fileSystemInfoEntry) => {
      const prevTimestamp = getTimestamps(this.prevTimestamps.get(filename));
      const timestamp = getTimestamps(fileSystemInfoEntry);

      return (
        isNaN(prevTimestamp) ||
        (prevTimestamp || this.startTime) < (timestamp || Infinity)
      );
    };

    const changedFiles = [];

    for (const [filename, timestamp] of fileTimestamps.entries()) {
      if (hasFileChanged(filename, timestamp)) {
        changedFiles.push(filename);
      }
    }

    this.prevTimestamps = fileTimestamps;

    return changedFiles;
  }
}

export default StylelintWebpackPlugin;
