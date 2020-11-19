import { isAbsolute, join, relative } from 'path';

// @ts-ignore
import NormalModule from 'webpack/lib/NormalModule';
// @ts-ignore
import WebpackError from 'webpack/lib/WebpackError';

import getOptions from './getOptions';
import StylelintError from './StylelintError';
import { replaceBackslashes, fileHasWarnings, fileHasErrors } from './utils';

/** @typedef {import('webpack').NormalModule} NormalModule */
/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('stylelint').LintResult} LintResult */

class StylelintWebpackPlugin {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    const { name: plugin } = this.constructor;

    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapAsync(plugin, (c, callback) => {
        this.run(c);
        callback();
      });
    }

    compiler.hooks.watchRun.tapAsync(plugin, (c, callback) => {
      this.run(c);
      callback();
    });
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  run(compiler) {
    const { name: plugin } = this.constructor;
    const context = this.getContext(compiler);
    const regexp = this.options.test;
    // eslint-disable-next-line
    const { lint } = require(this.options.stylelintPath);

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      /** @type {LintResult[]} */
      let warnings = [];
      /** @type {LintResult[]} */
      let errors = [];

      compilation.hooks.buildModule.tap(plugin, (m) => {
        if (!(m instanceof NormalModule)) {
          return;
        }

        const module = /** @type {NormalModule} */ (m);
        const file = module.resource;

        if (!regexp.test(relative(context, file))) {
          return;
        }

        lint({ ...this.options, files: replaceBackslashes(file) })
          // @ts-ignore
          .then(({ results }) => {
            ({ errors, warnings } = this.parseResults(results));

            if (warnings.length > 0) {
              compilation.warnings.push(
                // @ts-ignore
                StylelintError.format(this.options, warnings)
              );
            }
            if (errors.length > 0) {
              compilation.errors.push(
                // @ts-ignore
                StylelintError.format(this.options, errors)
              );
            }
          })
          // @ts-ignore
          .catch((e) => {
            compilation.errors.push(new WebpackError(e.message));
          });
      });

      compiler.hooks.afterEmit.tapAsync(plugin, (c, callback) => {
        if (this.options.failOnWarning && warnings.length > 0) {
          callback(StylelintError.format(this.options, warnings));
        } else if (this.options.failOnError && errors.length > 0) {
          callback(StylelintError.format(this.options, errors));
        } else {
          callback();
        }
      });
    });
  }

  /**
   *
   * @param {Array<LintResult>} results
   * @returns {{errors: Array<LintResult>, warnings: Array<LintResult>}}
   */
  parseResults(results) {
    /** @type {Array<LintResult>} */
    let errors = [];

    /** @type {Array<LintResult>} */
    let warnings = [];

    if (this.options.emitError) {
      errors = results.filter(
        (file) => fileHasErrors(file) || fileHasWarnings(file)
      );
    } else if (this.options.emitWarning) {
      warnings = results.filter(
        (file) => fileHasErrors(file) || fileHasWarnings(file)
      );
    } else {
      warnings = results.filter(
        (file) => !fileHasErrors(file) && fileHasWarnings(file)
      );
      errors = results.filter(fileHasErrors);
    }

    if (this.options.quiet && warnings.length) {
      warnings = [];
    }

    return {
      errors,
      warnings,
    };
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
}

export default StylelintWebpackPlugin;
