import { join } from 'path';

import pack from './utils/pack';

describe('context', () => {
  it('absolute', (done) => {
    const context = join(__dirname, 'fixtures', 'ok');
    const compiler = pack('ok', { context });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('relative', (done) => {
    const context = '../ok';
    const compiler = pack('ok', { context });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
