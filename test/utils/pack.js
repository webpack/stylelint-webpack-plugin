import webpack from 'webpack';

import conf from './conf';

export default (context, pluginConf = {}, webpackConf = {}) => {
  return webpack(conf(context, pluginConf, webpackConf));
};
