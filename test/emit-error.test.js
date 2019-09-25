import pack from './utils/pack';

describe('emit error', () => {
  const pluginConf = { emitError: true };

  it('does not print warnings or errors when there are none', (done) => {
    const compiler = pack('ok', pluginConf);

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('emits errors when asked to', (done) => {
    const compiler = pack('error', pluginConf);

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('error/test.scss');
      done();
    });
  });

  it('emits warnings as errors when asked to', (done) => {
    const compiler = pack('warning', pluginConf);

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('warning/test.scss');
      done();
    });
  });
});
