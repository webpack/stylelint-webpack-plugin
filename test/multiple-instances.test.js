import StylelintPlugin from '../src';

import pack from './utils/pack';

describe('multiple instances', () => {
  it("should don't fail", (done) => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'error.scss' }),
          new StylelintPlugin({ exclude: 'error.scss' }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should fail on first instance', (done) => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'good.scss' }),
          new StylelintPlugin({ exclude: 'error.scss' }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it('should fail on second instance', (done) => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'error.scss' }),
          new StylelintPlugin({ exclude: 'good.scss' }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
