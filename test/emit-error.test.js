import pack from './utils/pack';

describe('emit error', () => {
  it('should not emit errors if emitError is false', (done) => {
    const compiler = pack('error', { emitError: false });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should emit errors if emitError is undefined', (done) => {
    const compiler = pack('error');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should emit errors if emitError is true', (done) => {
    const compiler = pack('error', { emitError: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should emit errors, but not warnings if emitError is true and emitWarning is false', (done) => {
    const compiler = pack('full-of-problems', {
      emitError: true,
      emitWarning: false,
    });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should emit errors and warnings if emitError is true and emitWarning is undefined', (done) => {
    const compiler = pack('full-of-problems', { emitError: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
