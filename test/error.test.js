import pack from './utils/pack';

describe('error', () => {
  it('sends errors to the errors output only', (done) => {
    const compiler = pack('error');

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('works with multiple source files', (done) => {
    const compiler = pack('multiple-sources');

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(2);
      // Modules are not always processed in the same order.
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('multiple-sources/test.scss'),
          }),
          expect.objectContaining({
            message: expect.stringContaining('multiple-sources/_second.scss'),
          }),
        ])
      );
      done();
    });
  });

  it('only lints sources processed by webpack', (done) => {
    const compiler = pack('multiple-sources');

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(2);
      // Modules are not always processed in the same order.
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.not.stringContaining(
              'multiple-sources/_third.scss'
            ),
          }),
        ])
      );
      done();
    });
  });
});
