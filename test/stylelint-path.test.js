import { join } from 'path';

import pack from './utils/pack';

describe('stylelint path', () => {
  it('should use another instance of stylelint via stylelintPath config', (done) => {
    const stylelintPath = join(__dirname, 'mock/stylelint');
    const compiler = pack('stylelint-path', { stylelintPath });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toContain('Fake error');
      done();
    });
  });
});
