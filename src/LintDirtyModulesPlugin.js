import { isMatch } from 'micromatch';

import runCompilation from './runCompilation';

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
    }

    const dirtyOptions = { ...this.options };
    const glob = dirtyOptions.files.join('|');
    const changedFiles = this.getChangedFiles(compiler.fileTimestamps, glob);

    this.prevTimestamps = compiler.fileTimestamps;

    if (changedFiles.length) {
      dirtyOptions.files = changedFiles;
      runCompilation(dirtyOptions, compiler, callback);
    } else {
      callback();
    }
  }

  getChangedFiles(fileTimestamps, glob) {
    const hasFileChanged = (filename, timestamp) => {
      const prevTimestamps = this.prevTimestamps[filename]
        ? this.prevTimestamps[filename]
        : this.startTime;

      return prevTimestamps < timestamp ? timestamp : Infinity;
    };

    return Object.keys(fileTimestamps).filter(
      (filename) =>
        hasFileChanged(filename, fileTimestamps[filename]) &&
        isMatch(filename, glob)
    );
  }
}
