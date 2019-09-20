import { isMatch } from 'micromatch';

import linter from './linter';

export default class LintDirtyModulesPlugin {
  constructor(options) {
    this.options = options;
    this.startTime = Date.now();
    this.prevTimestamps = {};
    this.isFirstRun = true;
  }

  apply(compiler, callback) {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = compiler.fileTimestamps;
      callback();
      return;
    }

    const dirtyOptions = { ...this.options };
    const glob = dirtyOptions.files.join('|');
    const changedFiles = this.getChangedFiles(compiler.fileTimestamps, glob);

    this.prevTimestamps = compiler.fileTimestamps;

    if (changedFiles.length) {
      dirtyOptions.files = changedFiles;
      linter(dirtyOptions, compiler, callback);
    } else {
      callback();
    }
  }

  getChangedFiles(fileTimestamps, glob) {
    const hasFileChanged = (filename, timestamp) => {
      const prevTimestamp =
        this.prevTimestamps instanceof Map
          ? this.prevTimestamps.get(filename)
          : this.prevTimestamps[filename];

      return (prevTimestamp || this.startTime) < (timestamp || Infinity);
    };

    if (fileTimestamps instanceof Map) {
      const changedFiles = [];

      for (const [filename, timestamp] of fileTimestamps.entries()) {
        if (hasFileChanged(filename, timestamp) && isMatch(filename, glob)) {
          changedFiles.push(filename);
        }
      }

      return changedFiles;
    }

    return Object.keys(fileTimestamps).filter(
      (filename) =>
        hasFileChanged(filename, fileTimestamps[filename]) &&
        isMatch(filename, glob)
    );
  }
}
