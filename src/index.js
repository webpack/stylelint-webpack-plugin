import { isAbsolute, join } from 'path';

import getOptions from './getOptions';
import LintDirtyModulesPlugin from './LintDirtyModulesPlugin';
import linter from './linter';
import { parseFiles } from './utils';

class StylelintWebpackPlugin {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  apply(compiler) {
    const options = {
      ...this.options,
      files: parseFiles(this.options.files, this.getContext(compiler)),
    };

    const plugin = { name: this.constructor.name };

    if (options.lintDirtyModulesOnly) {
      const lintDirty = new LintDirtyModulesPlugin(compiler, options);

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapAsync(plugin, (compilation, callback) => {
        lintDirty.apply(compilation, callback);
      });
    } else {
      compiler.hooks.run.tapAsync(plugin, (compilation, callback) => {
        linter(options, compilation, callback);
      });

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapAsync(plugin, (compilation, callback) => {
        linter(options, compilation, callback);
      });
    }
  }

  getContext(compiler) {
    if (!this.options.context) {
      return compiler.options.context;
    }

    if (!isAbsolute(this.options.context)) {
      return join(compiler.options.context, this.options.context);
    }

    return this.options.context;
  }
}

export default StylelintWebpackPlugin;
