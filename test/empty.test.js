import { join } from 'path';

import webpack from 'webpack';

import StylelintPlugin from '../src/index';

describe('empty', () => {
  it('error when no files matching the pattern', (done) => {
    const compiler = webpack({
      context: join(__dirname, 'fixtures', 'empty'),
      mode: 'development',
      entry: './index',
      output: {
        path: join(__dirname, 'output'),
      },
      plugins: [new StylelintPlugin()],
    });

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('No files matching the pattern');
      done();
    });
  });
});
