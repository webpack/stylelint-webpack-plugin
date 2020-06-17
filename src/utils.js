import arrify from 'arrify';

const UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\())/g;

/**
 * @param {Array<string> | string} files
 * @param {string} context
 * @returns {Array<string>}
 */
export function parseFiles(files, context) {
  return arrify(files).map(
    (file) =>
      `${replaceBackslashes(context).replace(
        UNESCAPED_GLOB_SYMBOLS_RE,
        '\\$2'
      )}/${replaceBackslashes(file)}`
  );
}

/**
 * @param {string} str
 * @returns {string}
 */
export function replaceBackslashes(str) {
  return str.replace(/\\/g, '/');
}
