import { isMatch } from 'micromatch';

import linter from './linter';

function mapFileTimestampsToOldFormat(fileTimestamps) {
  for (const [filename, FileSystemInfoEntry] of fileTimestamps.entries()) {
    fileTimestamps.set(
      filename,
      FileSystemInfoEntry ? FileSystemInfoEntry.timestamp : null
    );
  }

  return fileTimestamps;
}

function getFileTimestamps(compilation) {
  return (
    compilation.fileTimestamps ||
    // eslint-disable-next-line no-underscore-dangle
    mapFileTimestampsToOldFormat(compilation.fileSystemInfo._fileTimestamps)
  );
}

export default class LintDirtyModulesPlugin {
  constructor(compiler, options) {
    this.compiler = compiler;
    this.options = options;
    this.startTime = Date.now();
    this.prevTimestamps = {};
    this.isFirstRun = true;
  }

  apply(compilation, callback) {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = getFileTimestamps(compilation);
      callback();
      return;
    }

    const dirtyOptions = { ...this.options };
    const newTimestamps = getFileTimestamps(compilation);
    const glob = dirtyOptions.files.join('|').replace(/\\/g, '/');
    const changedFiles = this.getChangedFiles(newTimestamps, glob);

    this.prevTimestamps = newTimestamps;

    if (changedFiles.length) {
      dirtyOptions.files = changedFiles;
      linter(dirtyOptions, this.compiler, callback);
    } else {
      callback();
    }
  }

  getChangedFiles(fileTimestamps, glob) {
    const hasFileChanged = (filename, timestamp) => {
      const prevTimestamp = this.prevTimestamps.get(filename);

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
