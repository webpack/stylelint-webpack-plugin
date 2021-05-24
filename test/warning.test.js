import pack from './utils/pack';

describe('warning', () => {
  it('should emit warnings', (done) => {
    const compiler = pack('warning');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
