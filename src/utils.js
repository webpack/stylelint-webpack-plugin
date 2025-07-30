// eslint-disable-next-line jsdoc/no-restricted-syntax
/** @typedef {any} EXPECTED_ANY */

const { statSync } = require("node:fs");
const { resolve } = require("node:path");

const normalizePath = require("normalize-path");

/**
 * @template T
 * @typedef {T extends (null | undefined)
 * ? []
 * : T extends string
 * ? [string]
 * : T extends readonly unknown[]
 * ? T
 * : T extends Iterable<infer T>
 * ? T[]
 * : [T]} ArrifyResult
 */

/* istanbul ignore next */
/**
 * @template T
 * @param {T} value value
 * @returns {ArrifyResult<T>} array of values
 */
function arrify(value) {
  if (value === null || value === undefined) {
    return /** @type {ArrifyResult<T>} */ ([]);
  }

  if (Array.isArray(value)) {
    return /** @type {ArrifyResult<T>} */ (value);
  }

  if (typeof value === "string") {
    return /** @type {ArrifyResult<T>} */ ([value]);
  }

  // @ts-expect-error need better types
  if (typeof value[Symbol.iterator] === "function") {
    // @ts-expect-error need better types
    return [...value];
  }

  return /** @type {ArrifyResult<T>} */ ([value]);
}

/**
 * @param {string | string[]} files files
 * @param {string} context context
 * @returns {string[]} normalized paths
 */
function parseFiles(files, context) {
  return arrify(files).map((/** @type {string} */ file) =>
    normalizePath(resolve(context, file)),
  );
}

/**
 * @param {string | string[]} patterns patterns
 * @param {string | string[]} extensions extensions
 * @returns {string[]} globs
 */
function parseFoldersToGlobs(patterns, extensions = []) {
  const extensionsList = arrify(extensions);
  const [prefix, postfix] = extensionsList.length > 1 ? ["{", "}"] : ["", ""];
  const extensionsGlob = extensionsList
    .map((/** @type {string} */ extension) => extension.replace(/^\./u, ""))
    .join(",");

  return arrify(patterns).map((/** @type {string} */ pattern) => {
    try {
      // The patterns are absolute because they are prepended with the context.
      const stats = statSync(pattern);
      /* istanbul ignore else */
      if (stats.isDirectory()) {
        return pattern.replace(
          /[/\\]*?$/u,
          `/**${
            extensionsGlob ? `/*.${prefix + extensionsGlob + postfix}` : ""
          }`,
        );
      }
    } catch {
      // Return the pattern as is on error.
    }
    return pattern;
  });
}

/**
 * @param {string} _ key, but unused
 * @param {EXPECTED_ANY} value value
 * @returns {{ [x: string]: EXPECTED_ANY }} result
 */
const jsonStringifyReplacerSortKeys = (_, value) => {
  /**
   * @param {{ [x: string]: EXPECTED_ANY }} sorted sorted
   * @param {string | number} key key
   * @returns {{ [x: string]: EXPECTED_ANY }} result
   */
  const insert = (sorted, key) => {
    sorted[key] = value[key];
    return sorted;
  };

  return value instanceof Object && !Array.isArray(value)
    ? Object.keys(value).sort().reduce(insert, {})
    : value;
};

module.exports = {
  arrify,
  jsonStringifyReplacerSortKeys,
  parseFiles,
  parseFoldersToGlobs,
};
