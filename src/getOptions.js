import validateOptions from 'schema-utils';

import schema from './options.json';

export default function getOptions(options) {
  validateOptions(schema, options, {
    name: 'Stylelint Webpack Plugin',
    baseDataPath: 'options',
  });

  const stylelintPath = options.stylelintPath || 'stylelint';

  // eslint-disable-next-line
  const { formatters } = require(stylelintPath);

  return {
    files: '**/*.s?(c|a)ss',
    formatter: formatters.string,
    stylelintPath,
    ...options,
  };
}
