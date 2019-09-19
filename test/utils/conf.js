import { join } from 'path';

import StyleLintPlugin from '../../src/index';

export default (webpackConf, pluginConf) => {
  return {
    mode: 'development',
    entry: './index',
    output: {
      path: join(__dirname, '..', 'output'),
    },
    plugins: [
      new StyleLintPlugin({
        configFile: join(__dirname, '..', '.stylelintrc'),
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
