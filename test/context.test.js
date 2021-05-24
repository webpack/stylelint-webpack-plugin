import { join } from 'path';

import pack from './utils/pack';

describe('context', () => {
  it('absolute', (done) => {
    const compiler = pack('good', { context: join(__dirname, 'fixtures') });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('relative', (done) => {
    const compiler = pack('good', { context: '../fixtures/' });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
