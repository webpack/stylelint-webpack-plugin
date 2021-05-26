import { join } from 'path';

import pack from './utils/pack';

describe('context', () => {
  it('absolute', (done) => {
    const compiler = pack('good', {
      context: join(__dirname, 'fixtures/good'),
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('relative', (done) => {
    const compiler = pack('good', { context: '../good/' });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
