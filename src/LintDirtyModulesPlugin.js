import { isMatch } from 'micromatch';

import linter from './linter';
import { replaceBackslashes } from './utils';

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('./getOptions').Options} Options */
/** @typedef {import('./linter').Lint} Lint */
/** @typedef {import('./linter').LinterCallback} LinterCallback */
/** @typedef {Partial<{timestamp:number} | number>} FileSystemInfoEntry */

export default class LintDirtyModulesPlugin {
  /**
   * @param {Lint} lint
   * @param {Compiler} compiler
   * @param {Options} options
   */
  constructor(lint, compiler, options) {
    this.lint = lint;
    this.compiler = compiler;
    this.options = options;
    this.startTime = Date.now();
    this.prevTimestamps = new Map();
    this.isFirstRun = true;
  }

  /**
   * @param {Compiler} compilation
   * @param {LinterCallback} callback
   * @returns {void}
   */
  apply(compilation, callback) {
    const fileTimestamps = compilation.fileTimestamps || new Map();

    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = fileTimestamps;
      callback();
      return;
    }

    const dirtyOptions = { ...this.options };

    // @ts-ignore
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

  /**
   * @param {Map<string, number|FileSystemInfoEntry>} fileTimestamps
   * @param {string | ReadonlyArray<string>} glob
   * @returns {Array<string>}
   */
  getChangedFiles(fileTimestamps, glob) {
    /**
     * @param {FileSystemInfoEntry} fileSystemInfoEntry
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
     * @param {FileSystemInfoEntry} fileSystemInfoEntry
     * @returns {boolean}
     */
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
