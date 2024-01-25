import StylelintPlugin from '../src';

import pack from './utils/pack';

describe('multiple instances', () => {
  it("should don't fail", async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'error.scss' }),
          new StylelintPlugin({ exclude: 'error.scss' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should fail on first instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'good.scss' }),
          new StylelintPlugin({ exclude: 'error.scss' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should fail on second instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new StylelintPlugin({ exclude: 'error.scss' }),
          new StylelintPlugin({ exclude: 'good.scss' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
