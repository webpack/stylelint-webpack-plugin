import pack from './utils/pack';

describe('emit warning', () => {
  const pluginConf = { emitWarning: true };

  it('does not print warnings or errors when there are none', (done) => {
    const compiler = pack('ok', pluginConf);

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('emits warnings when asked to', (done) => {
    const compiler = pack('warning', pluginConf);

    compiler.run((err, stats) => {
      const { warnings } = stats.compilation;
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(false);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('warning/test.scss');
      done();
    });
  });

  it('emits errors as warnings when asked to', (done) => {
    const compiler = pack('error', pluginConf);

    compiler.run((err, stats) => {
      const { warnings } = stats.compilation;
      expect(stats.hasWarnings()).toBe(true);
      expect(stats.hasErrors()).toBe(false);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('error/test.scss');
      done();
    });
  });
});
