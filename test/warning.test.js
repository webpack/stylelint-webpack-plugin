import pack from './utils/pack';

describe('warning', () => {
  it('sends warnings properly', (done) => {
    const compiler = pack('warning');

    compiler.run((err, stats) => {
      const { warnings } = stats.compilation;
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(false);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('warning/test.scss');
      done();
    });
  });
});
