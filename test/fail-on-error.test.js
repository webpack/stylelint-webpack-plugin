import pack from './utils/pack';

describe('fail on error', () => {
  it('should emits errors', (done) => {
    const compiler = pack('error', { failOnError: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should emit warnings when disabled', (done) => {
    const compiler = pack('error', { failOnError: false });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(false);
      expect(stats.hasWarnings()).toBe(true);
      done();
    });
  });

  it('should correctly indentifies a success', (done) => {
    const compiler = pack('good', { failOnError: true });

    compiler.run((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
