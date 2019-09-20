import webpack from 'webpack';

import conf from './conf';

export default (context, webpackConf = {}, pluginConf = {}) => {
  return webpack(conf(context, webpackConf, pluginConf));
};
