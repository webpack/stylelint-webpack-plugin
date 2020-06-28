import validateOptions from 'schema-utils';

import schema from './options.json';

/** @typedef {import("stylelint")} stylelint */

/**
 * @typedef {Object} Options
 * @property {string=} context
 * @property {boolean=} emitError
 * @property {boolean=} emitWarning
 * @property {boolean=} failOnError
 * @property {boolean=} failOnWarning
 * @property {Array<string> | string} files
 * @property {Function | string} formatter
 * @property {boolean=} lintDirtyModulesOnly
 * @property {boolean=} quiet
 * @property {string} stylelintPath
 */

/**
 * @param {Partial<Options>} pluginOptions
 * @returns {Options}
 */
export default function getOptions(pluginOptions) {
  const options = {
    files: '**/*.(s(c|a)ss|css)',
    formatter: 'string',
    stylelintPath: 'stylelint',
    ...pluginOptions,
  };

  // @ts-ignore
  validateOptions(schema, options, {
    name: 'Stylelint Webpack Plugin',
    baseDataPath: 'options',
  });

  // eslint-disable-next-line
  const stylelint = require(options.stylelintPath);

  options.formatter = getFormatter(stylelint, options.formatter);

  return options;
}

/**
 * @param {stylelint} stylelint
 * @param {Function | string} formatter
 * @returns {Function}
 */
function getFormatter({ formatters }, formatter) {
  if (typeof formatter === 'function') {
    return formatter;
  }

  // Try to get oficial formatter
  if (
    typeof formatter === 'string' &&
    // @ts-ignore
    typeof formatters[formatter] === 'function'
  ) {
    // @ts-ignore
    return formatters[formatter];
  }

  return formatters.string;
}
