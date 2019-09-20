import pack from './utils/pack';

describe('error', () => {
  it('sends errors to the errors output only', (done) => {
    const compiler = pack('error');

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('error/test.scss');
      done();
    });
  });

  it('works with multiple source files', (done) => {
    const compiler = pack('multiple-sources');

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('multiple-sources/_second.scss');
      expect(errors[0].message).toContain('multiple-sources/test.scss');
      done();
    });
  });
});
