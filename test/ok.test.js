import pack from './utils/pack';

describe('ok', () => {
  it('works with a simple file', (done) => {
    const compiler = pack('ok');

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
