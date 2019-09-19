import webpack from 'webpack';

import conf from './conf';

export default (webpackConf, pluginConf) => {
  return webpack(conf(webpackConf, pluginConf));
};
