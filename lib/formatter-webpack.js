'use strict';

const StylelintPluginError = require('./StylelintPluginError');

module.exports = function webpack (items) {
  const result = [];

  for (const item of items) {
    const file = item.source;

    for (const warning of item.warnings) {
      const line = warning.line;
      const column = warning.column;
      const text = warning.text;
      const message = file + '\n' + line + ':' + column + ' ' + text;

      result.push(new StylelintPluginError(message));
    }

    for (const warning of item.invalidOptionWarnings) {
      const message = 'stylelint\n0:0 ' + warning.text;
      result.push(new StylelintPluginError(message));
    }
  }

  return result;
};
