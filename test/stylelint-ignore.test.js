import { join } from 'path';

import webpack from 'webpack';

import StylelintWebpackPlugin from '../src';

describe('stylelintignore', () => {
  it('discern stylelintignore', (done) => {
    const compiler = webpack({
      context: join(__dirname, 'fixtures', 'stylelintignore'),
      mode: 'development',
      entry: './index',
      plugins: [new StylelintWebpackPlugin()],
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('not use .stylelintignore file', (done) => {
    const compiler = webpack({
      context: join(__dirname, 'fixtures', 'stylelintignore'),
      mode: 'development',
      entry: './index',
      plugins: [
        new StylelintWebpackPlugin({
          exclude: [],
        }),
      ],
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
