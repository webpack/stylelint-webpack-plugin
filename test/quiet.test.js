import pack from './utils/pack';

describe('quiet', () => {
  it('should not emit warnings if quiet is set', (done) => {
    const compiler = pack('warning', { quiet: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should emit errors, but not emit warnings if quiet is set', (done) => {
    const compiler = pack('full-of-problems', { quiet: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
