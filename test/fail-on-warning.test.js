import pack from './utils/pack';

describe('fail on warning', () => {
  it('should emits errors', async () => {
    const compiler = pack('warning', { failOnWarning: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should correctly indentifies a success', async () => {
    const compiler = pack('good', { failOnWarning: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
