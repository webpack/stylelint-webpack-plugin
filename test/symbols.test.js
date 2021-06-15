import pack from './utils/pack';

describe('symbols', () => {
  it('should return error', (done) => {
    const compiler = pack('[symbols]');

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
