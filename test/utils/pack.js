import webpack from 'webpack';

import conf from './conf';

export default (context, pluginConf = {}, webpackConf = {}) => {
  const compiler = webpack(conf(context, pluginConf, webpackConf));

  return {
    get outputPath() {
      return compiler.outputPath;
    },

    runAsync() {
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        });
      });
    },
    watch(options, fn) {
      return compiler.watch(options, fn);
    },
  };
};
