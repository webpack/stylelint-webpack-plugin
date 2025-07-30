const { validate } = require("schema-utils");

const schema = require("./options.json");

/** @typedef {import('./getStylelint').LinterOptions} StylelintOptions */
/** @typedef {import('./getStylelint').FormatterType} FormatterType */

/**
 * @typedef {object} OutputReport
 * @property {string=} filePath file path
 * @property {FormatterType=} formatter formatter
 */

/**
 * @typedef {object} PluginOptions
 * @property {string} context a string indicating the root of your files
 * @property {boolean} emitError the errors found will always be emitted
 * @property {boolean} emitWarning the warnings found will always be emitted
 * @property {string | string[]=} exclude specify the files and/or directories to exclude
 * @property {string | string[]} extensions specify the extensions that should be checked
 * @property {boolean} failOnError will cause the module build to fail if there are any errors
 * @property {boolean} failOnWarning will cause the module build to fail if there are any warning
 * @property {string | string[]} files specify directories, files, or globs
 * @property {FormatterType} formatter specify the formatter you would like to use to format your results
 * @property {boolean} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {boolean} quiet will process and report errors only and ignore warnings
 * @property {string} stylelintPath path to `stylelint` instance that will be used for linting
 * @property {OutputReport} outputReport writes the output of the errors to a file - for example, a `json` file for use for reporting
 * @property {number | boolean=} threads number of worker threads
 */

/** @typedef {Partial<PluginOptions & StylelintOptions>} Options */

/**
 * @param {Options} pluginOptions plugin options
 * @returns {Partial<PluginOptions>} partial plugin options
 */
function getOptions(pluginOptions) {
  const options = {
    cache: true,
    cacheLocation:
      "node_modules/.cache/stylelint-webpack-plugin/.stylelintcache",
    extensions: ["css", "scss", "sass"],
    emitError: true,
    emitWarning: true,
    failOnError: true,
    ...pluginOptions,
    ...(pluginOptions.quiet ? { emitError: true, emitWarning: false } : {}),
  };

  // @ts-expect-error need better types
  validate(schema, options, {
    name: "Stylelint Webpack Plugin",
    baseDataPath: "options",
  });

  return options;
}

/**
 * @param {Options} pluginOptions plugin options
 * @returns {Partial<StylelintOptions>} stylelint options
 */
function getStylelintOptions(pluginOptions) {
  const stylelintOptions = { ...pluginOptions };

  // Keep the files and formatter option because it is common to both the plugin and Stylelint.
  const { files, formatter, ...stylelintOnlyOptions } = schema.properties;

  // No need to guard the for-in because schema.properties has hardcoded keys.
  for (const option in stylelintOnlyOptions) {
    // @ts-expect-error need better types
    delete stylelintOptions[option];
  }

  return stylelintOptions;
}

module.exports = {
  getOptions,
  getStylelintOptions,
};
