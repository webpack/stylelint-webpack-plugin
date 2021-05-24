import pack from './utils/pack';

describe('empty', () => {
  it('no error when no files matching', (done) => {
    const compiler = pack('empty');

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
