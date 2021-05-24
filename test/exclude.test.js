import pack from './utils/pack';

describe('exclude', () => {
  it('should exclude with globs', (done) => {
    const compiler = pack('exclude', { exclude: ['*test*'] });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should exclude files', (done) => {
    const compiler = pack('exclude', { exclude: ['test.scss'] });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should exclude folders', (done) => {
    const compiler = pack('exclude-folder', { exclude: ['folder'] });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
