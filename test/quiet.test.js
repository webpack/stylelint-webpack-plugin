import pack from './utils/pack';

describe('quiet', () => {
  const pluginConf = { quiet: true };

  it('does not print warnings or errors when there are none', (done) => {
    const compiler = pack('ok', pluginConf);

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('emits errors only', (done) => {
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

  it('does not emits warnings', (done) => {
    const compiler = pack('warning', pluginConf);

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
