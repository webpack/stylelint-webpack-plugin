import pack from './utils/pack';

describe('emit warning', () => {
  it('should not emit warnings if emitWarning is false', (done) => {
    const compiler = pack('warning', { emitWarning: false });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      done();
    });
  });

  it('should emit warnings if emitWarning is undefined', (done) => {
    const compiler = pack('warning');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      done();
    });
  });

  it('should emit warnings if emitWarning is true', (done) => {
    const compiler = pack('warning', { emitWarning: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      done();
    });
  });

  it('should emit warnings, but not warnings if emitWarning is true and emitError is false', (done) => {
    const compiler = pack('full-of-problems', {
      emitWarning: true,
      emitError: false,
    });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should emit warnings and errors if emitWarning is true and emitError is undefined', (done) => {
    const compiler = pack('full-of-problems', { emitWarning: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
