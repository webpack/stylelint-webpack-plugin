import pack from './utils/pack';

describe('lint dirty modules only', () => {
  it('skips linting on initial run', (done) => {
    const compiler = pack('error', {}, { lintDirtyModulesOnly: true });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
