import pack from './utils/pack';

describe('stylelint ignore', () => {
  it('should ignore file', async () => {
    const compiler = pack('stylelint-ignore');
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
