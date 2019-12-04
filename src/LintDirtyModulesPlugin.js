import { isMatch } from 'micromatch';

import linter from './linter';

export default class LintDirtyModulesPlugin {
  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = options;
    this.startTime = Date.now();
    this.prevTimestamps = {};
    this.isFirstRun = true;
  }

  apply(compilation, callback) {
    const fileTimestamps = compilation.fileTimestamps || new Map();

    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = fileTimestamps;
      callback();
      return;
    }

    const dirtyOptions = { ...this.options };
    const glob = dirtyOptions.files.join('|').replace(/\\/g, '/');
    const changedFiles = this.getChangedFiles(fileTimestamps, glob);

    this.prevTimestamps = fileTimestamps;

    if (changedFiles.length) {
      dirtyOptions.files = changedFiles;
      linter(dirtyOptions, this.compiler, callback);
    } else {
      callback();
    }
  }

  getChangedFiles(fileTimestamps, glob) {
    const getTimestamps = (fileSystemInfoEntry) => {
      return fileSystemInfoEntry && fileSystemInfoEntry.timestamp
        ? fileSystemInfoEntry.timestamp
        : fileSystemInfoEntry;
    };

    const hasFileChanged = (filename, fileSystemInfoEntry) => {
      const prevTimestamp = getTimestamps(this.prevTimestamps.get(filename));
      const timestamp = getTimestamps(fileSystemInfoEntry);

      return (prevTimestamp || this.startTime) < (timestamp || Infinity);
    };

    const changedFiles = [];

    for (const [filename, timestamp] of fileTimestamps.entries()) {
      if (hasFileChanged(filename, timestamp) && isMatch(filename, glob)) {
        changedFiles.push(filename);
      }
    }

    return changedFiles;
  }
}
