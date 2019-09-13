import validateOptions from 'schema-utils';

import { formatters } from 'stylelint';

import schema from './options.json';

export default function getOptions(options) {
  validateOptions(schema, options, {
    name: 'Stylelint Webpack Plugin',
    baseDataPath: 'options',
  });

  return {
    files: '**/*.s?(c|a)ss',
    formatter: formatters.string,
    ...options,
  };
}
