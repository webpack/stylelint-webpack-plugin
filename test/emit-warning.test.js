import pack from './utils/pack';

describe('emit warning', () => {
  it('should not emit warnings if emitWarning is false', async () => {
    const compiler = pack('warning', { emitWarning: false });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
  });

  it('should emit warnings if emitWarning is undefined', async () => {
    const compiler = pack('warning');
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
  });

  it('should emit warnings if emitWarning is true', async () => {
    const compiler = pack('warning', { emitWarning: true });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
  });

  it('should emit warnings, but not warnings if emitWarning is true and emitError is false', async () => {
    const compiler = pack('full-of-problems', {
      emitWarning: true,
      emitError: false,
    });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit warnings and errors if emitWarning is true and emitError is undefined', async () => {
    const compiler = pack('full-of-problems', { emitWarning: true });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(true);
  });
});
