import { isMatch } from 'micromatch';

import linter from './linter';
import { replaceBackslashes } from './utils';

export default class LintDirtyModulesPlugin {
  constructor(lint, compiler, options) {
    this.lint = lint;
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
    const glob = replaceBackslashes(dirtyOptions.files.join('|'));
    const changedFiles = this.getChangedFiles(fileTimestamps, glob);

    this.prevTimestamps = fileTimestamps;

    if (changedFiles.length) {
      dirtyOptions.files = changedFiles;
      linter(this.lint, dirtyOptions, this.compiler, callback);
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
        changedFiles.push(replaceBackslashes(filename));
      }
    }

    return changedFiles;
  }
}
