import validateOptions from 'schema-utils';

import schema from './options.json';

export default function getOptions(pluginOptions) {
  const options = {
    files: '**/*.s?(c|a)ss',
    formatter: 'string',
    stylelintPath: 'stylelint',
    ...pluginOptions,
  };

  validateOptions(schema, options, {
    name: 'Stylelint Webpack Plugin',
    baseDataPath: 'options',
  });

  // eslint-disable-next-line
  const stylelint = require(options.stylelintPath);

  options.formatter = getFormatter(stylelint, options.formatter);

  return options;
}

function getFormatter({ formatters }, formatter) {
  if (typeof formatter === 'function') {
    return formatter;
  }

  // Try to get oficial formatter
  if (
    typeof formatter === 'string' &&
    typeof formatters[formatter] === 'function'
  ) {
    return formatters[formatter];
  }

  return formatters.string;
}
