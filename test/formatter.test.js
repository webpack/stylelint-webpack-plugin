import { formatters } from 'stylelint';

import pack from './utils/pack';

describe('formatter', () => {
  it('should use default formatter', (done) => {
    const compiler = pack('error');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });

  it('should use default formatter when invalid', (done) => {
    const compiler = pack('error', { formatter: 'invalid' });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });

  it('should use string formatter', (done) => {
    const compiler = pack('error', { formatter: 'json' });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });

  it('should use function formatter', (done) => {
    const compiler = pack('error', { formatter: formatters.verbose });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });
});
