import { resolve } from 'path';

import pack from './utils/pack';

describe('stylelint-webpack-plugin', () => {
  it('works with a simple file', (done) => {
    const compiler = pack({
      context: resolve('./test/fixtures/lint-free'),
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
