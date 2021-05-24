import pack from './utils/pack';

describe('fail on warning', () => {
  it('should emits errors', (done) => {
    const compiler = pack('warning', { failOnWarning: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should correctly indentifies a success', (done) => {
    const compiler = pack('good', { failOnWarning: true });

    compiler.run((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
