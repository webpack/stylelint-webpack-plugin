import { join } from 'path';

import pack from './utils/pack';

describe('stylelint path', () => {
  it('should use another instance of stylelint via stylelintPath config', (done) => {
    const stylelintPath = join(__dirname, 'mock/stylelint');
    const compiler = pack('ok', { stylelintPath });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
