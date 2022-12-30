import pack from './utils/pack';

describe('stylelint ignore', () => {
  it('should ignore file', (done) => {
    const compiler = pack('stylelint-ignore');

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
