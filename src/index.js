import { isAbsolute, join } from 'path';

import arrify from 'arrify';

import getOptions from './getOptions';
import LintDirtyModulesPlugin from './LintDirtyModulesPlugin';
import linter from './linter';

class StylelintWebpackPlugin {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  apply(compiler) {
    const context = this.getContext(compiler);
    const options = { ...this.options };

    options.files = arrify(options.files).map((file) =>
      join(context, '/', file)
    );

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
