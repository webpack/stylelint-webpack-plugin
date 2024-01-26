import { formatters } from 'stylelint';

import pack from './utils/pack';

describe('formatter', () => {
  it('should use default formatter', async () => {
    const compiler = pack('error');
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });

  it('should use default formatter when invalid', async () => {
    const compiler = pack('error', { formatter: 'invalid' });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });

  it('should use string formatter', async () => {
    const compiler = pack('error', { formatter: 'json' });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });

  it('should use function formatter', async () => {
    const compiler = pack('error', { formatter: formatters.verbose });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });
});
